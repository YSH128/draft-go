package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 서버 재시작 시 중단된 경매를 복구하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionRecoveryService {

    private final DraftRepository draftRepository;
    private final RedisAuctionRepository redisRepo;
    private final AuctionService auctionService;
    private final RoundTerminateService roundTerminateService;

    /**
     * 애플리케이션 시작 시 중단된 경매를 복구
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void recoverInterruptedAuctions() {
        log.info("Checking for interrupted auctions on server startup...");

        // IN_DRAFT 상태인 모든 드래프트 조회
        List<Draft> inProgressDrafts = draftRepository.findAllByStatus(DraftStatus.IN_DRAFT);

        if (inProgressDrafts.isEmpty()) {
            log.info("No interrupted auctions found.");
            return;
        }

        log.info("Found {} drafts in IN_DRAFT status. Checking for interruptions...", inProgressDrafts.size());

        for (Draft draft : inProgressDrafts) {
            try {
                recoverDraftAuction(draft.getId());
            } catch (Exception e) {
                log.error("Failed to recover auction for draftId: {}. Error: {}", draft.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * 특정 드래프트의 경매 복구
     */
    private void recoverDraftAuction(Long draftId) {
        RoundStatus currentRound = redisRepo.getCurrent(draftId);

        // Case 1: Redis에 경매 상태가 있지만 타이머가 없는 경우 (서버 다운으로 타이머가 멈춤)
        if (currentRound != null && !redisRepo.hasTimer(draftId)) {
            log.warn("Found interrupted auction for draftId: {}. Timer was lost. Terminating current round...", draftId);

            // 현재 라운드를 강제 종료하고 다음 라운드 시작
            roundTerminateService.terminateRound(draftId);

            log.info("Successfully recovered auction for draftId: {}", draftId);
        }
        // Case 2: Redis에 경매 상태도 없는 경우 (완전히 중단됨)
        else if (currentRound == null) {
            log.warn("Found draft in IN_DRAFT status but no auction state in Redis for draftId: {}. Starting new round...", draftId);

            // 새로운 경매 라운드 시작
            auctionService.processNextRound(draftId);

            log.info("Successfully restarted auction for draftId: {}", draftId);
        }
        // Case 3: 정상 진행 중 (타이머도 있고 상태도 있음)
        else {
            int remainingTime = redisRepo.getRemainingTime(draftId);
            log.info("Auction for draftId: {} is running normally. Remaining time: {}s", draftId, remainingTime);
        }
    }

    /**
     * 관리자가 수동으로 특정 드래프트의 경매를 복구할 수 있는 메서드
     */
    @Transactional
    public void manualRecovery(Long draftId) {
        log.info("Manual recovery requested for draftId: {}", draftId);

        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));

        if (draft.getStatus() != DraftStatus.IN_DRAFT) {
            throw new IllegalStateException("Draft is not in IN_DRAFT status. Current status: " + draft.getStatus());
        }

        recoverDraftAuction(draftId);
    }
}
