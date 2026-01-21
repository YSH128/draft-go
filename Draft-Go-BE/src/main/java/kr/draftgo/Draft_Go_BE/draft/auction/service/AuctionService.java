package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionState;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final RedisAuctionRepository redisRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final AuctionEventPublisher publisher;

    public void startAuction(Long draftId) {
        draftMemberRepo.findNextWaiting(draftId).ifPresentOrElse(next -> {
            AuctionState state = AuctionState.start(next.getId(), next.getName());
            redisRepo.setCurrent(draftId, state);
            redisRepo.startTimer(draftId, 30);
            publisher.start(draftId, state);
        }, () -> {
            System.out.println("No more members to draft. Auction finished.");
        });
    }

    public AuctionStatusResponse getCurrentState(Long draftId) {
        AuctionState state = redisRepo.getCurrent(draftId);
        BidInfo bid = redisRepo.getBid(draftId);
        String nextPlayerName = draftMemberRepo.findNextUpcoming(draftId)
                .map(DraftMember::getName)
                .orElse(null);
        return AuctionStatusResponse.of(state, bid, nextPlayerName);
    }
}
