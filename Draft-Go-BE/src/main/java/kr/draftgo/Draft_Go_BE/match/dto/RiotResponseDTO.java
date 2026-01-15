package kr.draftgo.Draft_Go_BE.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiotResponseDTO {
    private Account account;
    private SoloRank soloRank;
    private List<MostChampion> mostChampions;
    private MatchAnalysis matchAnalysis;
    private List<MatchSummary> matchHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Account {
        private String gameName;
        private String tagLine;
        private String puuid;
        private long summonerLevel;
        private int profileIconId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SoloRank {
        private boolean hasRank;
        private String tier;
        private String division;
        private int lp;
        private int wins;
        private int losses;
        private double winRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MostChampion {
        private long championId;
        private String championName;
        private long championPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchAnalysis {
        private int totalGames;
        private int wins;
        private int losses;
        private double winRate;
        private String mainPosition;
        private double mainPositionRate;
        private String subPosition;
        private double subPositionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchSummary {
        private String matchId;
        private String championName;
        private int kills;
        private int deaths;
        private int assists;
        private boolean win;
        private String gameMode;
        private long gameEndTimestamp;
    }
}
