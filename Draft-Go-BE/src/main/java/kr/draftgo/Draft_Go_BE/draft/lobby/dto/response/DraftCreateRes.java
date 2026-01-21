package kr.draftgo.Draft_Go_BE.draft.lobby.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 드래프트 생성 응답
 */
@Getter
@Builder
public class DraftCreateRes {
    private Long draftId;
    private String teamMemberCode;
    private String teamLeaderCode;
}
