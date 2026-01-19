package kr.draftgo.Draft_Go_BE.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MostChampionDTO {
    private String championName;
    private int totalGames;
    private int wins;
    private int losses;
    private double winRate; // Percentage
    private double kills;
    private double deaths;
    private double assists;
    private double kda;
}
