package kr.draftgo.Draft_Go_BE.draft.lobby.dto.response;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.dto.CodeInfo;
import kr.draftgo.Draft_Go_BE.draft.common.dto.LeaderDetail;
import kr.draftgo.Draft_Go_BE.draft.common.dto.MemberDetail;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 로비 정보 조회 응답
 */
@Getter
@Builder
public class LobbyInfoRes {
    private Long draftId;
    private String title;
    private Integer maxTeamCount;
    private Integer startPoint;
    private Integer startPrice;
    private DraftStatus status;
    private List<LeaderDetail> leaders;
    private List<MemberDetail> members;
    private List<UserSummary> observers;
    private CodeInfo codes;
    private Object draftSnapshot; // 추후 개발
}
