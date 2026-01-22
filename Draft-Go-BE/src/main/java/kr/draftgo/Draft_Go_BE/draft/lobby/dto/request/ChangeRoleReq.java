package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 역할 변경 요청
 */
@Getter
@NoArgsConstructor
public class ChangeRoleReq {
    @NotNull(message = "대상 사용자 ID는 필수입니다")
    @Schema(description = "대상 사용자 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long targetUserId;

    @NotBlank(message = "역할은 필수입니다")
    @Pattern(regexp = "^(LEADER|MEMBER)$", message = "역할은 LEADER 또는 MEMBER만 가능합니다")
    @Schema(description = "변경할 역할 (LEADER 또는 MEMBER)", example = "LEADER", requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"LEADER", "MEMBER"})
    private String role; // "LEADER" or "MEMBER"
}
