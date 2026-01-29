package kr.draftgo.Draft_Go_BE.draft.common.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
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
    private Tier tier;
    private Division division;
    private Integer leaguePoints;
}
