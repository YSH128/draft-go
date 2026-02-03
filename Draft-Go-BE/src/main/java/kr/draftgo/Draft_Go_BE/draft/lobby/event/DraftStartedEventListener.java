package kr.draftgo.Draft_Go_BE.draft.lobby.event;

import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 드래프트 시작 이벤트 리스너
 * 트랜잭션 커밋 이후 WebSocket 브로드캐스트 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DraftStartedEventListener {

    private final LobbyWebSocketService lobbyWebSocketService;

    /**
     * 드래프트 시작 이벤트 처리
     * 트랜잭션이 성공적으로 커밋된 이후에만 실행됨
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDraftStarted(DraftStartedEvent event) {
        log.info("[Event] Draft started - Broadcasting to clients. DraftId: {}", event.getDraftId());

        try {
            // 트랜잭션 커밋 완료 후 WebSocket 브로드캐스트
            lobbyWebSocketService.broadcastLobbyUpdate(event.getDraftId(), LobbyEventType.DRAFT_STARTED);

            log.info("[Event] Draft started broadcast completed. DraftId: {}", event.getDraftId());
        } catch (Exception e) {
            // WebSocket 브로드캐스트 실패는 로그만 기록하고 트랜잭션에 영향 없음
            log.error("[Event] Failed to broadcast draft started event. DraftId: {}", event.getDraftId(), e);
        }
    }
}
