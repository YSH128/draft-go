package kr.draftgo.Draft_Go_BE.draft.lobby.event;

import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 로비 업데이트 이벤트 리스너
 * 트랜잭션 커밋 이후 WebSocket 브로드캐스트 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LobbyUpdateEventListener {
    private final LobbyWebSocketService lobbyWebSocketService;

    /**
     * 로비 업데이트 이벤트 처리
     * 트랜잭션이 성공적으로 커밋된 이후에만 실행됨
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleLobbyUpdate(LobbyUpdateEvent event) {
        log.info("[Event] Lobby update - Broadcasting to clients. DraftId: {}, EventType: {}",
                event.getDraftId(), event.getEventType());
        try {
            lobbyWebSocketService.broadcastLobbyUpdate(event.getDraftId(), event.getEventType());
        } catch (Exception e) {
            log.error("[Event] Failed to broadcast lobby update. DraftId: {}, EventType: {}",
                    event.getDraftId(), event.getEventType(), e);
        }
    }
}
