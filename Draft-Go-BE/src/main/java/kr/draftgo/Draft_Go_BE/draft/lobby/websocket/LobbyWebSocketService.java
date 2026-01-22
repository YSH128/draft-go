package kr.draftgo.Draft_Go_BE.draft.lobby.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * 로비 WebSocket 브로드캐스트 서비스
 * 로비 상태 변경 시 모든 참가자에게 이벤트 타입 전송
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LobbyWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 로비 업데이트 브로드캐스트 - eventType만 전송
     * @param draftId 드래프트 ID
     * @param eventType 이벤트 타입
     */
    public void broadcastLobbyUpdate(Long draftId, LobbyEventType eventType) {
        try {
            // 메시지 생성 - eventType과 draftId만 포함
            LobbyUpdateMessage updateMessage = LobbyUpdateMessage.builder()
                    .eventType(eventType)
                    .draftId(draftId)
                    .build();

            // 브로드캐스트
            String destination = "/topic/lobby/" + draftId;
            messagingTemplate.convertAndSend(destination, updateMessage);

            log.info("Lobby update broadcasted - draftId: {}, eventType: {}", draftId, eventType);

        } catch (Exception e) {
            log.error("Failed to broadcast lobby update - draftId: {}, eventType: {}", draftId, eventType, e);
        }
    }
}
