package kr.draftgo.Draft_Go_BE.draft.common.dto;

import lombok.Getter;
import lombok.Builder;
import kr.draftgo.Draft_Go_BE.member.domain.Position;

/**
 *  팀장 상세 정보
 */
@Builder
@Getter
public class LeaderDetail {

    private Integer leaguePoints;
    private String tier;
    private Boolean isReady;
    private Position position;
    private String name;
    private Long id;
    private Integer leaderPoint; // 관리자가 설정한 팀장 포인트
}