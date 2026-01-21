package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 준비 완료 토글 요청
 */
@Getter
@NoArgsConstructor
public class ReadyToggleReq {
    private Boolean isReady;
}
