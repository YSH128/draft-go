package kr.draftgo.Draft_Go_BE.draft.lobby.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 로비 업데이트 브로드캐스트 메시지 (간소화 버전)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LobbyUpdateMessage {

    /**
     * 이벤트 타입
     */
    private LobbyEventType eventType;

    /**
     * 드래프트 ID
     */
    private Long draftId;
}
