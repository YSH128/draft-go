package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 준비 완료 토글 요청
 */
@Getter
@NoArgsConstructor
public class ReadyToggleReq {
    @NotNull(message = "준비 상태는 필수입니다")
    @Schema(description = "준비 완료 상태 (true: 준비 완료, false: 준비 취소)", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    private Boolean isReady;
}
