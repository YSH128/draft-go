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

@Table(name = "member_stat", uniqueConstraints = @UniqueConstraint(columnNames = { "member_id", "season_id" }))
public class MemberStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "season_id", nullable = false, length = 10)
    private String seasonId;

    @Column(name = "tier", length = 15)
    @Enumerated(EnumType.STRING)
    private Tier tier;

    @Column(name = "division", length = 5)
    @Enumerated(EnumType.STRING)
    private Division division;

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

    public void updateProfile(Tier tier, Division division, Integer leaguePoint, BigDecimal rankWinRate,
            Integer rankWins, Integer rankLoseRate, BigDecimal lastedWinRate,
            Integer lastedWins, Integer lastedLosses) {
        if (tier != null) {
            this.tier = tier;
        }
        if (division != null) {
            this.division = division;
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
