package kr.draftgo.Draft_Go_BE.member.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "member_stat")
public class MemberStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    @Column(name = "`rank`", length = 15)
    private String rank;

    @Column(name = "league_point")
    private Integer leaguePoint;

    @Column(name = "rank_win_rate", precision = 5, scale = 2)
    private BigDecimal rankWinRate;

    @Column(name = "rank_wins")
    private Integer rankWins;

    @Column(name = "rank_lose_rate")
    private Integer rankLoseRate;

    @Column(name = "lasted_win_rate", precision = 5, scale = 2)
    private BigDecimal lastedWinRate;

    @Column(name = "lasted_wins")
    private Integer lastedWins;

    @Column(name = "lasted_losses")
    private Integer lastedLosses;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateProfile(String rank, Integer leaguePoint, BigDecimal rankWinRate,
                             Integer rankWins, Integer rankLoseRate, BigDecimal lastedWinRate,
                             Integer lastedWins, Integer lastedLosses) {
        if (rank != null) {
            this.rank = rank;
        }
        if (leaguePoint != null) {
            this.leaguePoint = leaguePoint;
        }
        if (rankWinRate != null) {
            this.rankWinRate = rankWinRate;
        }
        if (rankWins != null) {
            this.rankWins = rankWins;
        }
        if (rankLoseRate != null) {
            this.rankLoseRate = rankLoseRate;
        }
        if (lastedWinRate != null) {
            this.lastedWinRate = lastedWinRate;
        }
        if (lastedWins != null) {
            this.lastedWins = lastedWins;
        }
        if (lastedLosses != null) {
            this.lastedLosses = lastedLosses;
        }
        this.updatedAt = LocalDateTime.now();
    }
}
