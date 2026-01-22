package kr.draftgo.Draft_Go_BE.draft.lobby.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LobbyParticipant {
    private Long memberId;
    private String gameName;
    private String role; // "LEADER" or "MEMBER"
    private Position position;
    private boolean isReady; // LEADER ONLY
    @Builder.Default
    private Integer leaderPoint = 0; // LEADER ONLY - 팀장의 포인트, 기본값 0
}
