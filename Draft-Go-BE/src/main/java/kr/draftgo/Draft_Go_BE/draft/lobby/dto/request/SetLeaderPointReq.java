package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팀장 포인트 등록 요청
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SetLeaderPointReq {
    @NotNull(message = "팀장 ID는 필수입니다")
    @Schema(description = "팀장 사용자 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long leaderId;

    @NotNull(message = "포인트는 필수입니다")
    @Min(value = 0, message = "포인트는 0 이상이어야 합니다")
    @Schema(description = "설정할 포인트 (0 이상)", example = "1000", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer point;
}
