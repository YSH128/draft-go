package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
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

/**
 * 경매 낙찰/유찰 처리를 담당하는 트랜잭션 서비스
 * RoundTerminateService에서 분리하여 AOP self-invocation 문제 해결
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BidCompletionService {
    private final TeamRepository teamRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final TeammateRepository teammateRepo;
    private final RedisAuctionRepository redisRepo;

    /**
     * 낙찰 처리 (DB 트랜잭션)
     * - 팀 포인트 DB 커밋 (락 적용)
     * - Teammate 추가
     * - DraftMember 상태 변경 (COMPLETED)
     *
     * 주의: Redis 포인트 차감은 이 메서드를 호출하기 전에 완료되어야 함
     */
    @Transactional
    public void handleSuccessfulBid(Long draftId, Long draftMemberId, BidInfo bid) {
        if (!bid.exists()) {
            log.error("Bid info not found for successful bid. draftId: {}", draftId);
            return;
        }

        Long teamId = bid.getTeamId();
        int price = bid.getPrice();

        // DB에 포인트 커밋 (비관적 락 적용)
        Team team = teamRepo.findByIdWithLock(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        if (team.getPoint() != null) {
            team.updatePoint(team.getPoint() - price);
            teamRepo.save(team);
            log.info("Team {} point updated to {} in DB (draftId: {})", teamId, team.getPoint(), draftId);
        }

        DraftMember draftMember = draftMemberRepo.findById(draftMemberId)
                .orElseThrow(() -> new IllegalArgumentException("DraftMember not found: " + draftMemberId));

        // Teammate 추가
        Teammate newTeammate = Teammate.builder()
                .team(team)
                .member(draftMember.getMember())
                .point(price)
                .isLeader(false)
                .position(draftMember.getPosition())
                .build();
        teammateRepo.save(newTeammate);

        // Redis에 팀의 보유 포지션 추가
        String positionName = draftMember.getPosition().name();
        redisRepo.addTeamPosition(draftId, teamId, positionName);
        log.info("Added position to Redis after bid: draftId={}, teamId={}, position={}",
                draftId, teamId, positionName);

        // DraftMember 상태를 COMPLETED로 변경
        draftMemberRepo.complete(draftMemberId);

        log.info("Member {} completed for draftId: {} at price {}", draftMember.getName(), draftId, price);
    }

    /**
     * 유찰 처리 (DB 트랜잭션)
     * - DraftMember 상태 변경 (SKIPPED)
     * - turnOrder를 맨 뒤로 이동
     */
    @Transactional
    public void handleSkippedBid(Long draftMemberId) {
        // SKIPPED 상태로 변경하고 turnOrder를 맨 뒤로 이동
        draftMemberRepo.skip(draftMemberId);
        draftMemberRepo.moveToBack(draftMemberId);
    }
}
