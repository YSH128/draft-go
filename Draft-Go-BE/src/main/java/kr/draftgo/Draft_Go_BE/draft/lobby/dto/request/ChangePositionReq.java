package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 포지션 변경 요청
 */
@Getter
@NoArgsConstructor
public class ChangePositionReq {
    @NotNull(message = "대상 사용자 ID는 필수입니다")
    @Schema(description = "대상 사용자 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long targetUserId;

    @NotNull(message = "포지션은 필수입니다")
    @Schema(description = "변경할 포지션 (TOP, JUNGLE, MID, BOT, SUP, OBSERVER)", example = "TOP", requiredMode = Schema.RequiredMode.REQUIRED)
    private Position position;
}
