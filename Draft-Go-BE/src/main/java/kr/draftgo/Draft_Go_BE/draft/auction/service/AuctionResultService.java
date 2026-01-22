package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionState;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
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
            // Redis에서 포인트 차감 (실시간 경매용)
            redisRepo.deductTeamPoint(draftId, bid.getTeamId(), bid.getPrice());
            // [최적화] DB 포인트 차감은 경매 전체 종료 후 일괄 처리하므로 제거
            // teamRepo.deductPoint(bid.getTeamId(), bid.getPrice());

            // Teammate 추가 로직
            Team team = teamRepo.findById(bid.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            DraftMember draftMember = draftMemberRepo.findById(state.getDraftMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("DraftMember not found"));

            Teammate newTeammate = Teammate.builder()
                    .team(team)
                    .member(draftMember.getMember())
                    .point(bid.getPrice()) // 낙찰가 기록
                    .isLeader(false)
                    .position(draftMember.getPosition())
                    .build();
            teammateRepo.save(newTeammate);

            draftMemberRepo.complete(state.getDraftMemberId());
        } else {
            draftMemberRepo.skip(state.getDraftMemberId());
        }

        redisRepo.clear(draftId);
        publisher.ended(draftId, bid);

        // [추가] 변경된 Queue와 Team 정보 브로드캐스팅
        publisher.publishDraftQueue(draftId, auctionService.getDraftQueue(draftId));
        publisher.publishTeamInfo(draftId, auctionService.getTeamInfos(draftId));

        auctionService.startAuction(draftId); // 다음 경매 or 종료
    }
}
