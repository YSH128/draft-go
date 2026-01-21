package kr.draftgo.Draft_Go_BE.draft.room.dto;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import lombok.Builder;
import lombok.Getter;

/**
 * 드래프트 목록 조회 응답 DTO
 */
@Getter
@Builder
public class DraftListRes {
    private Long draftId;
    private String title;
    private String ownerName;
    private Integer maxTeamCount;
    private Integer participantCount;
    private DraftStatus status;
}
