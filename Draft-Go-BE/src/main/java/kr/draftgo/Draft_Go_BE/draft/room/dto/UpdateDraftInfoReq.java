package kr.draftgo.Draft_Go_BE.draft.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 드래프트 정보 수정 요청
 * 모든 필드는 선택적이며, null이 아닌 값만 업데이트됩니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDraftInfoReq {

    /**
     * 드래프트 제목 (최대 100자, 선택적)
     */
    @Size(max = 100, message = "제목은 최대 100자까지 입력 가능합니다")
    private String title;

    /**
     * 시작 가격 (선택적, 값이 있을 경우 1 이상)
     */
    @Min(value = 1, message = "시작 가격은 1 이상이어야 합니다")
    private Integer startPrice;

    /**
     * 시작 포인트 (선택적, 값이 있을 경우 1 이상)
     */
    @Min(value = 1, message = "시작 포인트는 1 이상이어야 합니다")
    private Integer startPoint;

    /**
     * 최대 팀 수 (선택적, 값이 있을 경우 2 이상)
     */
    @Min(value = 2, message = "최대 팀 수는 2 이상이어야 합니다")
    private Integer maxTeamCount;
}
