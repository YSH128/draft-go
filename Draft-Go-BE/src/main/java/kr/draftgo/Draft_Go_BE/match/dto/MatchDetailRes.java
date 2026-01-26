package kr.draftgo.Draft_Go_BE.match.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MatchDetailRes {
    private String matchId;
    private Long gameCreation;
    private Long gameDuration;
    private String gameMode;

    // List of all 10 participants
    private List<ParticipantRes> participants;
}
