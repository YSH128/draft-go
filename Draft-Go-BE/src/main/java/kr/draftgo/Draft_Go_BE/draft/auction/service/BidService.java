package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.dto.BidReq;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.AuctionKey;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.BidLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidLuaExecutor luaExecutor;
    private final RedisAuctionRepository redisRepo;
    private final AuctionEventPublisher publisher;

    public void placeBid(Long draftId, Member member, BidReq req) {

        if (req.teamId() == null) {
            throw new IllegalArgumentException("Team ID must be provided");
        }

        Long memberId = member.getId();

        // 1. 팀장 검증: Redis에서 팀장 멤버 ID 조회
        Long leaderMemberId = redisRepo.getTeamLeader(draftId, req.teamId());
        if (leaderMemberId == null) {
            throw new CustomException(ErrorType.TEAM_LEADER_NOT_FOUND, "팀장 정보를 찾을 수 없습니다.");
        }
        if (!leaderMemberId.equals(memberId)) {
            throw new CustomException(
                ErrorType.UNAUTHORIZED_LEADER_ONLY,
                "팀장만 입찰할 수 있습니다."
            );
        }

        // 2. 가격 검증 (0 이하 불가)
        if (req.price() <= 0) {
            throw new IllegalArgumentException("Bid price must be positive");
        }

        // 3. 팀 포인트 사전 검증 (빠른 실패)
        Integer currentPoint = redisRepo.getTeamPoint(draftId, req.teamId());
        if (currentPoint == null) {
            throw new IllegalStateException("Team point not initialized in Redis. teamId: " + req.teamId());
        }

        if (currentPoint < req.price()) {
            throw new CustomException(ErrorType.INSUFFICIENT_POINT,
                String.format("보유 포인트(%d)가 입찰가(%d)보다 부족합니다.", currentPoint, req.price()));
        }

        // 4. 현재 경매 중인 선수의 포지션 확인 (Redis의 RoundStatus에서 조회)
        RoundStatus currentRound = redisRepo.getCurrent(draftId);
        if (currentRound == null) {
            throw new CustomException(ErrorType.AUCTION_NOT_IN_PROGRESS, "진행 중인 경매가 없습니다.");
        }

        if (currentRound.getPosition() == null) {
            throw new IllegalStateException("Current round position is null for draftId: " + draftId);
        }

        String auctionPosition = currentRound.getPosition().name();

        // 5. 팀이 이미 해당 포지션의 선수를 보유하고 있는지 확인 (Redis에서 조회)
        boolean hasPosition = redisRepo.hasTeamPosition(draftId, req.teamId(), auctionPosition);
        if (hasPosition) {
            throw new CustomException(
                ErrorType.POSITION_ALREADY_FILLED,
                String.format("이미 %s 포지션 선수를 보유하고 있어 입찰할 수 없습니다.",
                    currentRound.getPosition().getDisplayName())
            );
        }

        // 6. 현재 최고 입찰가 확인 및 검증 (현재 최고가보다 커야 함)
        BidInfo currentBid = redisRepo.getBid(draftId);
        if (currentBid.exists()) {
            if (req.price() <= currentBid.getPrice()) {
                throw new CustomException(
                    ErrorType.BID_PRICE_TOO_LOW,
                    String.format("입찰가는 현재 최고가(%dp)보다 커야 합니다.", currentBid.getPrice())
                );
            }
        }
        // 첫 입찰인 경우에는 최소 금액 검증만 통과하면 됨

        // 7. Lua 스크립트로 원자적 입찰 처리
        luaExecutor.tryBid(
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId),
                req.teamId(),
                memberId,
                req.price());

        // 8. 입찰 후 남은 시간 조회 (타이머가 30초로 리셋되었으므로)
        Integer remainingSeconds = redisRepo.getRemainingSeconds(draftId);

        // 9. WebSocket으로 입찰 이벤트 발행
        publisher.bidUpdated(draftId, req.teamId(), req.price(), remainingSeconds);
    }
}
