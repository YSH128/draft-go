package kr.draftgo.Draft_Go_BE.draft.common.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Builder;
import lombok.Getter;

/**
 * 팀원 상세 정보
 */
@Getter
@Builder
public class MemberDetail {
    private Long id;
    private String name;
    private Position position;
    private String tier;
    private Integer leaguePoints;
}
