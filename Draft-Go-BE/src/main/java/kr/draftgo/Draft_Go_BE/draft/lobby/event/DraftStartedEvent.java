package kr.draftgo.Draft_Go_BE.draft.lobby.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 드래프트 시작 이벤트
 * 트랜잭션 커밋 이후 WebSocket 브로드캐스트를 위해 사용
 */
@Getter
@AllArgsConstructor
public class DraftStartedEvent {
    private final Long draftId;
}
