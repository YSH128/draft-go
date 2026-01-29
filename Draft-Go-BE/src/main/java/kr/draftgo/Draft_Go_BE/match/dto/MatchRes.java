package kr.draftgo.Draft_Go_BE.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRes {
    private String matchId;
    private Long gameCreation;
    private Long gameDuration;
    private String gameMode;
    private String championName;
    private Integer championId;
    private int kills;
    private int deaths;
    private int assists;
    private boolean win;
    private double kda;

    // Additional fields if needed (spells, items, runes, etc.)
}
