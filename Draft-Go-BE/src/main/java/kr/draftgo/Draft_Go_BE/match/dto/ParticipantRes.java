package kr.draftgo.Draft_Go_BE.match.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ParticipantRes {
    private String summonerName;
    private String tagLine;
    private String championName;
    private String championIconUrl;
    private int championId;

    private int teamId;
    private String teamPosition;

    private int kills;
    private int deaths;
    private int assists;
    private double kda;
    private boolean win;

    // Items
    private List<String> itemUrls; // 0-5 + 6(Ward)
    private String roleBoundItemUrl; // New field for roleBoundItem -> treated as item URL

    // Spells
    private List<String> spellUrls; // D, F

    // Runes
    private List<String> runeUrls; // Primary, Sub

    private int totalMinionsKilled;
    private int championLevel;
}
