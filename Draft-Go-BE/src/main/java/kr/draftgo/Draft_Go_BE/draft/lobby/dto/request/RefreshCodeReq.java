package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

/**
 * 초대 코드 리프레시 요청
 */
@Getter
@Schema(description = "초대 코드 리프레시 요청")
public class RefreshCodeReq {

    @NotBlank(message = "코드 타입은 필수입니다")
    @Pattern(regexp = "^(LEADER|MEMBER)$", message = "코드 타입은 LEADER 또는 MEMBER만 가능합니다")
    @Schema(description = "코드 타입 (LEADER: 팀장, MEMBER: 팀원)", example = "LEADER", requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"LEADER", "MEMBER"})
    private String codeType;
}
