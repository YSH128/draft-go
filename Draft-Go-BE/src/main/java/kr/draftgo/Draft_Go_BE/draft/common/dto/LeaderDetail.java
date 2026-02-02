package kr.draftgo.Draft_Go_BE.draft.common.dto;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.Getter;
import lombok.Builder;
import kr.draftgo.Draft_Go_BE.member.domain.Position;

import java.util.List;

/**
 *  팀장 상세 정보
 */
@Builder
@Getter
public class LeaderDetail {

    private Integer leaguePoints;
    private Tier tier;
    private Division division;
    private Boolean isReady;
    private Position position;
    private String name;
    private Long id;
    private Integer leaderPoint; // 관리자가 설정한 팀장 포인트
    private String profileIconUrl; // 프로필 아이콘 URL
    private List<MostChampionRes> mostChampions; // 모스트 챔피언 목록
}