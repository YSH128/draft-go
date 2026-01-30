package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.controller.BidRequest;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.AuctionKey;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.BidLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidLuaExecutor luaExecutor;
    private final RedisAuctionRepository redisRepo;
    private final AuctionEventPublisher publisher;
    private final DraftMemberRepository draftMemberRepo;
    private final TeammateRepository teammateRepo;

    public void placeBid(Long draftId, Member member, BidRequest req) {

        if (req.teamId() == null) {
            throw new IllegalArgumentException("Team ID must be provided");
        }

        Long memberId = member.getId();

        // 팀장 검증: 입찰하는 멤버가 해당 팀의 팀장인지 확인
        teammateRepo.findByTeamIdAndIsLeaderTrue(req.teamId())
                .ifPresentOrElse(
                    leader -> {
                        if (!leader.getMember().getId().equals(memberId)) {
                            throw new CustomException(
                                ErrorType.UNAUTHORIZED_LEADER_ONLY,
                                String.format("팀장(%s)만 입찰할 수 있습니다.", leader.getMember().getGameName())
                            );
                        }
                    },
                    () -> {
                        throw new CustomException(ErrorType.TEAM_LEADER_NOT_FOUND, "팀장을 찾을 수 없습니다.");
                    }
                );

        // 가격 검증 (0 이하 불가)
        if (req.price() <= 0) {
            throw new IllegalArgumentException("Bid price must be positive");
        }

        // 팀 포인트 사전 검증 (빠른 실패)
        // Redis에서 포인트 확인
        Integer currentPoint = redisRepo.getTeamPoint(draftId, req.teamId());
        if (currentPoint < req.price()) {
            throw new InsufficientPointException();
        }

        // 현재 경매 중인 선수의 포지션 확인
        RoundStatus currentRound = redisRepo.getCurrent(draftId);
        if (currentRound == null) {
            throw new CustomException(ErrorType.AUCTION_NOT_IN_PROGRESS, "진행 중인 경매가 없습니다.");
        }

        DraftMember currentDraftMember = draftMemberRepo.findById(currentRound.getDraftMemberId())
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_MEMBER_NOT_FOUND, "경매 대상 선수를 찾을 수 없습니다."));

        Position auctionPosition = currentDraftMember.getPosition();

        // 팀이 이미 해당 포지션의 선수를 보유하고 있는지 확인
        boolean hasPosition = teammateRepo.existsByTeamIdAndPosition(req.teamId(), auctionPosition);
        if (hasPosition) {
            throw new CustomException(
                ErrorType.POSITION_ALREADY_FILLED,
                String.format("이미 %s 포지션 선수를 보유하고 있어 입찰할 수 없습니다.", auctionPosition.getDisplayName())
            );
        }

        // 현재 최고 입찰가 확인 및 검증 (현재 최고가보다 커야 함)
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

        luaExecutor.tryBid(
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId),
                req.teamId(),
                memberId,
                req.price());

        // 입찰 후 남은 시간 조회 (타이머가 30초로 리셋되었으므로)
        Integer remainingSeconds = redisRepo.getRemainingSeconds(draftId);

        publisher.bidUpdated(draftId, req.teamId(), req.price(), remainingSeconds);
    }
}
