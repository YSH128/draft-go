package kr.draftgo.Draft_Go_BE.draft.domain;

import jakarta.persistence.*;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "teammate")
public class Teammate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private Integer point;

    @Column(nullable = false)
    private Boolean isLeader;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Position position;

    @Builder
    public Teammate(Team team, Member member, Integer point, Boolean isLeader, Position position) {
        this.team = team;
        this.member = member;
        this.point = point;
        this.isLeader = isLeader;
        this.position = position;
    }
}
