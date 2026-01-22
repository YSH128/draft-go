package kr.draftgo.Draft_Go_BE.draft.auction.dto.response;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TeamInfoResponse {
    private Long teamId;
    private String teamName;
    private int currentPoint;
    private List<TeammateResponse> members;

    public static TeamInfoResponse of(Team team, List<TeammateResponse> members) {
        return TeamInfoResponse.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .currentPoint(team.getPoint())
                .members(members)
                .build();
    }
}
