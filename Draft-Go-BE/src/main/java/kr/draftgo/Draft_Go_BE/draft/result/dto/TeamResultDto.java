package kr.draftgo.Draft_Go_BE.draft.result.dto;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 팀별 경매 결과 DTO
 */
@Getter
@Builder
public class TeamResultDto {
    private Long teamId;
    private String teamName;
    private Integer finalPoint;         // 최종 남은 포인트
    private Integer spentPoint;         // 사용한 포인트
    private List<PlayerResultDto> players;

    public static TeamResultDto of(Team team, Integer spentPoint, List<PlayerResultDto> players) {
        return TeamResultDto.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .finalPoint(team.getPoint())
                .spentPoint(spentPoint)
                .players(players)
                .build();
    }
}
