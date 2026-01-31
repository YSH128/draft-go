package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RoundLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoundTerminateService {

    private final RoundLuaExecutor roundLuaExecutor;
    private final RedisAuctionRepository redisRepo;
    private final AuctionEventPublisher auctionEventPublisher;
    private final RoundStartService roundStartService;
    private final AuctionService auctionService;
    private final BidCompletionService bidCompletionService;

    /**
     * 타이머 만료에 따라 경매 라운드 종료 처리
     * Lua 스크립트로 멱등성 보장: 이미 종료된 라운드는 다시 처리하지 않음
     *
     * @param draftId 드래프트 ID
     * @param throwOnNoRound true일 경우 활성 라운드가 없으면 예외를 던짐 (복구 모드용)
     */
    public void terminateRound(Long draftId, boolean throwOnNoRound) {
        // 1. Lua 스크립트로 원자적으로 상태 전환 (BIDDING -> COMPLETED/SKIPPED)
        int terminateResult = roundLuaExecutor.terminateRound(draftId);

        if (terminateResult == 0) {
            // 동시성 환경에서 다른 프로세스에서 이미 종료 처리한 경우 이 상태로 올 수 있음.
            // 또는 Redis 데이터가 유실된 경우.
            String message = "No active round found or already terminated for draftId: " + draftId;

            if (throwOnNoRound) {
                log.error("{}. Recovery needed.", message);
                throw new IllegalStateException(message + ". Cannot terminate non-existent round.");
            }

            log.warn("{}. Skipping termination.", message);
            return;
        }

        // 2. 현재 라운드 상태 및 입찰 정보 조회
        RoundStatus currentState = redisRepo.getCurrent(draftId);
        BidInfo bid = redisRepo.getBid(draftId);

        if (currentState == null || bid == null) {
            // 드래프트 도중에는 일어나지 않아야 함.
            // currentState가 없다는 것은 Redis 데이터가 유실된 것임.
            // processNextRound로 복구 시도가 필요할 수 있음
            log.error("Current state not found after termination. draftId: {}", draftId);
            return;
        }

        Long currentMemberId = currentState.getDraftMemberId();
        Long bidderTeamId = bid.getTeamId();
        int bidPrice = bid.getPrice();

        // 3. 즉시 roundEnded 이벤트 발행 (클라이언트에게 종료 알림)
        auctionEventPublisher.roundEnded(draftId, bid);

        // 4. Redis 포인트 차감 (트랜잭션 밖에서 처리)
        if (terminateResult == 1 && bid.exists()) {
            redisRepo.deductTeamPoint(draftId, bidderTeamId, bidPrice);
            log.info("Redis point deducted: draftId={}, teamId={}, price={}",
                    draftId, bidderTeamId, bidPrice);
        }

        // 5. DB 트랜잭션 처리 (BidCompletionService로 위임)
        try {
            if (terminateResult == 1) {
                // COMPLETED: 낙찰 처리 (DB 트랜잭션 + 비관적 락)
                bidCompletionService.handleSuccessfulBid(draftId, currentMemberId, bid);
            } else if (terminateResult == 2) {
                // SKIPPED: 유찰 처리 (DB 트랜잭션)
                bidCompletionService.handleSkippedBid(currentMemberId);
            }
        } catch (Exception e) {
            // DB 처리 중 오류 발생 시 Redis 포인트 복구
            log.warn("Error during bid completion handling for draftId: {}", draftId, e);
            redisRepo.restoreTeamPoint(draftId, bidderTeamId, bidPrice);
            throw e; // 트랜잭션 롤백을 위해 예외 재던짐
        }
        // 6. 변경된 Queue와 Team 정보 브로드캐스팅
        auctionEventPublisher.publishTeamInfo(draftId, auctionService.getTeamInfos(draftId));
        auctionEventPublisher.publishDraftQueue(draftId, auctionService.getDraftQueue(draftId));

        // 7. 다음 라운드 시작 (RoundStartService에 위임)
        roundStartService.startNextRound(draftId);
    }

    /**
     * 타이머 만료에 따라 경매 라운드 종료 처리 (기본 동작)
     * 활성 라운드가 없으면 조용히 무시
     */
    public void terminateRound(Long draftId) {
        terminateRound(draftId, false);
    }
}
