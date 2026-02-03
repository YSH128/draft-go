package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.dto.BidReq;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.event.AuctionWebSocketEvent;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.AuctionKey;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.BidLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidLuaExecutor luaExecutor;
    private final RedisAuctionRepository redisRepo;
    private final ApplicationEventPublisher eventPublisher;

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

        // 2. 현재 경매 중인 선수의 정보 확인 (Redis의 RoundStatus에서 조회)
        RoundStatus currentRound = redisRepo.getCurrent(draftId);
        if (currentRound == null) {
            throw new CustomException(ErrorType.AUCTION_NOT_IN_PROGRESS, "진행 중인 경매가 없습니다.");
        }

        if (currentRound.getPosition() == null) {
            throw new IllegalStateException("Current round position is null for draftId: " + draftId);
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

        // 4. 팀이 이미 해당 포지션의 선수를 보유하고 있는지 확인 (Redis에서 조회)
        String auctionPosition = currentRound.getPosition().name();
        boolean hasPosition = redisRepo.hasTeamPosition(draftId, req.teamId(), auctionPosition);
        if (hasPosition) {
            throw new CustomException(
                ErrorType.POSITION_ALREADY_FILLED,
                String.format("이미 %s 포지션 선수를 보유하고 있어 입찰할 수 없습니다.",
                    currentRound.getPosition().getDisplayName())
            );
        }

        // 5. Lua 스크립트로 원자적 입찰 처리 (가격 검증 포함)
        Integer minBidPrice = currentRound.getMinBidPrice() != null ? currentRound.getMinBidPrice() : 0;
        int result = luaExecutor.tryBid(
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId),
                req.teamId(),
                memberId,
                req.price(),
                minBidPrice);

        // 6. Lua 스크립트 결과에 따른 예외 처리
        if (result == -1) {
            throw new CustomException(ErrorType.AUCTION_NOT_IN_PROGRESS, "경매가 진행 중이 아닙니다. (타이머 만료)");
        } else if (result == -2) {
            BidInfo currentBid = redisRepo.getBid(draftId);
            throw new CustomException(
                ErrorType.BID_PRICE_TOO_LOW,
                String.format("입찰가는 현재 최고가(%dp)보다 커야 합니다.",
                    currentBid != null ? currentBid.getPrice() : 0)
            );
        } else if (result == -3) {
            throw new IllegalStateException("Redis 입찰 데이터가 손상되었습니다.");
        } else if (result == -4) {
            throw new CustomException(
                ErrorType.BID_PRICE_TOO_LOW,
                String.format("입찰가는 최소 %d포인트 이상이어야 합니다.", minBidPrice)
            );
        } else if (result != 1) {
            throw new IllegalStateException("입찰 처리 중 알 수 없는 오류가 발생했습니다. (code: " + result + ")");
        }

        // 7. 입찰 후 남은 시간 조회 (타이머가 10초로 리셋되었을 수 있음)
        Integer remainingSeconds = redisRepo.getRemainingSeconds(draftId);

        // 8. WebSocket으로 입찰 이벤트 발행 (트랜잭션 커밋 후)
        // 참고: BidService는 @Transactional이 아니지만, 이벤트는 즉시 발행됨
        // 만약 트랜잭션 내에서 호출된다면 커밋 후 발행됨
        eventPublisher.publishEvent(new AuctionWebSocketEvent.BidEvent(
                draftId, req.teamId(), req.price(), remainingSeconds));
    }
}
