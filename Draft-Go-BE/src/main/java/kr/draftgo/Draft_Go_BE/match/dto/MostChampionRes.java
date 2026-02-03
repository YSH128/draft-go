package kr.draftgo.Draft_Go_BE.match.dto;

import kr.draftgo.Draft_Go_BE.match.domain.MostChampionStat.MostChampion;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MostChampionRes {
    private int championId;
    private String championName;
    private String championIconUrl;
    private int totalGames;
    private int totalWins;
    private int totalLosses;
    private double winRate;
    private double kda;

    public static MostChampionRes from(MostChampion entity) {
        return MostChampionRes.builder()
                .championId(entity.getChampionId())
                .championName(entity.getChampionName())
                .totalGames(entity.getTotalGames())
                .totalWins(entity.getTotalWins())
                .totalLosses(entity.getTotalLosses())
                .winRate(entity.getWinRate())
                .kda(entity.getKda())
                .build();
    }
}
