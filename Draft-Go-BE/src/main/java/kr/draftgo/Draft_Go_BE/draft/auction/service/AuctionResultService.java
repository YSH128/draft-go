package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionState;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuctionResultService {

    private final RedisAuctionRepository redisRepo;
    private final TeamRepository teamRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final TeammateRepository teammateRepo;
    private final AuctionService auctionService;
    private final AuctionEventPublisher publisher;

    public void completeAuction(Long draftId) {

        BidInfo bid = redisRepo.getBid(draftId);
        AuctionState state = redisRepo.getCurrent(draftId);

        if (bid.exists()) {
            teamRepo.deductPoint(bid.getTeamId(), bid.getPrice());
            teammateRepo.add(state.getMemberId(), bid.getTeamId());
            draftMemberRepo.complete(state.getDraftMemberId());
        } else {
            draftMemberRepo.skip(state.getDraftMemberId());
        }

        redisRepo.clear(draftId);
        publisher.ended(draftId, bid);

        auctionService.startAuction(draftId); // 다음 경매 or 종료
    }
}
