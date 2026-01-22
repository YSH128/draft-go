package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberStatRes {
    private String rank; // Combined Tier + Rank
    private Integer leaguePoints;
    private BigDecimal winRate;
    private Integer wins;
    private Integer losses;
    private BigDecimal recentWinRate;

    public static MemberStatRes from(MemberStat stat) {
        if (stat == null)
            return null;

        return MemberStatRes.builder()
                .rank(stat.getRank())
                .leaguePoints(stat.getLeaguePoint())
                .winRate(stat.getRankWinRate())
                .wins(stat.getRankWins())
                .losses(stat.getRankLoseRate())
                .recentWinRate(stat.getLastedWinRate())
                .build();
    }
}
