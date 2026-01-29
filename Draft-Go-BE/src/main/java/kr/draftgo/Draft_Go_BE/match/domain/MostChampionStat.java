package kr.draftgo.Draft_Go_BE.match.domain;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Builder
@Document(collection = "most_champion_stats")
public class MostChampionStat {

    @Id
    private String id;

    private Long memberId; // MySQL Member ID

    private List<MostChampion> mostChampions;

    @Getter
    @Builder
    public static class MostChampion {
        private int championId;
        private String championName;
        private int totalGames;
        private int totalWins;
        private int totalLosses;
        private double winRate;
        private double kda;
    }
}
