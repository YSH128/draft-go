package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

/**
 * 초대 코드 리프레시 요청
 */
@Getter
@Schema(description = "초대 코드 리프레시 요청")
public class RefreshCodeReq {

    @Schema(description = "코드 타입 (LEADER: 팀장, MEMBER: 팀원)", example = "LEADER", allowableValues = {"LEADER", "MEMBER"})
    private String codeType;
}
