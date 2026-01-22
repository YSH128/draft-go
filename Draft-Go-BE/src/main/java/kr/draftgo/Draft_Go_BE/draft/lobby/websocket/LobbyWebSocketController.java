package kr.draftgo.Draft_Go_BE.draft.lobby.websocket;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

/**
 * 로비 WebSocket Controller
 * 클라이언트의 WebSocket 구독 처리
 */
@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lobby WebSocket", description = "로비 실시간 통신 API")
public class LobbyWebSocketController {

    /**
     * 로비 구독 시 처리
     * 클라이언트: SUBSCRIBE /topic/lobby/{draftId}
     */
    @SubscribeMapping("/topic/lobby/{draftId}")
    public void onSubscribe(Long draftId) {
        log.info("Client subscribed to lobby - draftId: {}", draftId);
    }
}
