package kr.draftgo.Draft_Go_BE.draft.common.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 참여 코드 정보
 */
@Getter
@Builder
public class CodeInfo {
    private String teamMemberCode;
    private String teamLeaderCode;
}
