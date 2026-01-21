package kr.draftgo.Draft_Go_BE.draft.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class DraftDto {

    @Getter
    @NoArgsConstructor
    public static class DraftCreateReq {
        private String title;
        private Integer maxTeamCount;
        private Integer startPrice;
        private Integer startPoint;
    }

    @Getter
    @Builder
    public static class DraftCreateRes {
        private Long draftId;
        private String teamMemberCode; // Spec says teamMemberCode
        private String teamLeaderCode; // Spec says teamLeaderCode
    }

    @Getter
    @NoArgsConstructor
    public static class JoinDraftReq {
        private String draftCode;
        private Position position;
    }
}
