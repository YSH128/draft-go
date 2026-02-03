package kr.draftgo.Draft_Go_BE.draft.lobby.event;

import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 로비 업데이트 이벤트
 * 트랜잭션 커밋 후 WebSocket 브로드캐스트를 위한 이벤트
 */
@Getter
@RequiredArgsConstructor
public class LobbyUpdateEvent {
    private final Long draftId;
    private final LobbyEventType eventType;
}
