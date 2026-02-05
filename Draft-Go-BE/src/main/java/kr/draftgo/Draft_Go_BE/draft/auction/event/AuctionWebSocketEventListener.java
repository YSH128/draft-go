package kr.draftgo.Draft_Go_BE.draft.auction.event;

import kr.draftgo.Draft_Go_BE.draft.auction.service.AuctionQueryService;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 경매 WebSocket 이벤트 리스너
 * 트랜잭션 커밋 이후 WebSocket 브로드캐스트 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionWebSocketEventListener {
    private final AuctionEventPublisher auctionEventPublisher;
    private final AuctionQueryService auctionQueryService;

    /**
     * 라운드 시작 이벤트 처리
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundStart(AuctionWebSocketEvent.RoundStartEvent event) {
        log.info("[Event] Round start - Broadcasting to clients. DraftId: {}", event.getDraftId());
        try {
            auctionEventPublisher.roundStart(event.getDraftId(), event.getRoundStatus());
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast round start. DraftId: {}", event.getDraftId(), e);
        }
    }

    /**
     * 입찰 이벤트 처리
     * BidService는 @Transactional이 없으므로 즉시 처리
     */
    @org.springframework.context.event.EventListener
    public void handleBid(AuctionWebSocketEvent.BidEvent event) {
        log.info("[Event] Bid placed - Broadcasting to clients. DraftId: {}, TeamId: {}, Price: {}",
                event.getDraftId(), event.getTeamId(), event.getPrice());
        try {
            auctionEventPublisher.bidUpdated(event.getDraftId(), event.getTeamId(),
                    event.getPrice(), event.getRemainingSeconds());
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast bid. DraftId: {}", event.getDraftId(), e);
        }
    }

    /**
     * 라운드 종료 이벤트 처리
     * RoundTerminateService는 @Transactional이 없으므로 즉시 처리
     */
    @org.springframework.context.event.EventListener
    public void handleRoundEnded(AuctionWebSocketEvent.RoundEndedEvent event) {
        log.info("[Event] Round ended - Broadcasting to clients. DraftId: {}", event.getDraftId());
        try {
            auctionEventPublisher.roundEnded(event.getDraftId(), event.getBidInfo());
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast round ended. DraftId: {}", event.getDraftId(), e);
        }
    }

    /**
     * 팀 정보 업데이트 이벤트 처리
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamInfoUpdate(AuctionWebSocketEvent.TeamInfoUpdateEvent event) {
        log.info("[Event] Team info update - Broadcasting to clients. DraftId: {}", event.getDraftId());
        try {
            auctionEventPublisher.publishTeamInfo(event.getDraftId(),
                    auctionQueryService.getTeamInfos(event.getDraftId()));
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast team info. DraftId: {}", event.getDraftId(), e);
        }
    }

    /**
     * 대기열 업데이트 이벤트 처리
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleQueueUpdate(AuctionWebSocketEvent.QueueUpdateEvent event) {
        log.info("[Event] Queue update - Broadcasting to clients. DraftId: {}", event.getDraftId());
        try {
            auctionEventPublisher.publishDraftQueue(event.getDraftId(),
                    auctionQueryService.getDraftQueue(event.getDraftId()));
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast queue. DraftId: {}", event.getDraftId(), e);
        }
    }

    /**
     * 경매 완전 종료 이벤트 처리 (COMPLETED 상태)
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAuctionEnded(AuctionWebSocketEvent.AuctionEndedEvent event) {
        log.info("[Event] Auction ended - Broadcasting to clients. DraftId: {}", event.getDraftId());
        try {
            auctionEventPublisher.auctionEnded(event.getDraftId());
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast auction ended. DraftId: {}", event.getDraftId(), e);
        }
    }
}
