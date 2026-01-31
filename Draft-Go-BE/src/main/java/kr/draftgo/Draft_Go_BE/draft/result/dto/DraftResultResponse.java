package kr.draftgo.Draft_Go_BE.draft.result.dto;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 경매 결과 상세 조회 응답 DTO
 */
@Getter
@Builder
public class DraftResultResponse {
    private Long draftId;
    private String title;
    private String ownerName;
    private Integer startPrice;
    private Integer startPoint;
    private Integer maxTeamCount;
    private DraftStatus status;
    private LocalDateTime createdAt;

    private List<TeamResultDto> teams;

    public static DraftResultResponse from(Draft draft, List<TeamResultDto> teams) {
        return DraftResultResponse.builder()
                .draftId(draft.getId())
                .title(draft.getTitle())
                .ownerName(draft.getOwner().getGameName())
                .startPrice(draft.getStartPrice())
                .startPoint(draft.getStartPoint())
                .maxTeamCount(draft.getMaxTeamCount())
                .status(draft.getStatus())
                .createdAt(draft.getCreatedAt())
                .teams(teams)
                .build();
    }
}
