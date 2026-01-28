package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RoundTerminateService {

    private final RedisAuctionRepository redisRepo;
    private final TeamRepository teamRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final TeammateRepository teammateRepo;
    private final AuctionService auctionService;
    private final AuctionEventPublisher publisher;

    /**
     * 경매 라운드 종료 처리
     * 멱등성 보장: 이미 종료된 경매는 다시 처리하지 않음
     */
    public void terminateRound(Long draftId) {
        // 멱등성 보장: 진행 중인 경매가 없으면 무시
        RoundStatus state = redisRepo.getCurrent(draftId);
        if (state == null) {
            log.warn("No active round found for draftId: {}. Skipping termination.", draftId);
            return;
        }

        BidInfo bid = redisRepo.getBid(draftId);

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
            log.info("Member {} completed for draftId: {} at price {}", draftMember.getName(), draftId, bid.getPrice());
        } else {
            // 유찰 시 SKIPPED 상태로 변경하고 turnOrder를 맨 뒤로 이동
            draftMemberRepo.skip(state.getDraftMemberId());
            draftMemberRepo.moveToBack(state.getDraftMemberId());
            log.info("Member {} skipped for draftId: {}", state.getPlayerName(), draftId);
        }

        redisRepo.clear(draftId);
        publisher.timeOver(draftId, bid);

        // [추가] 변경된 Queue와 Team 정보 브로드캐스팅
        publisher.publishDraftQueue(draftId, auctionService.getDraftQueue(draftId));
        publisher.publishTeamInfo(draftId, auctionService.getTeamInfos(draftId));

        auctionService.processNextRound(draftId); // 다음 경매 or 종료
    }
}
