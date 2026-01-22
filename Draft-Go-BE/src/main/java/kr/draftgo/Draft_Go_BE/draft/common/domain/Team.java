package kr.draftgo.Draft_Go_BE.draft.common.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "team")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 15)
    private String teamName;

    @Column(nullable = false)
    private Integer point;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_id", nullable = false)
    private Draft draft;

    @Builder
    public Team(String teamName, Draft draft, Integer point) {
        this.teamName = teamName;
        this.draft = draft;
        this.point = (point != null) ? point : 0;
    }

    public void updatePoint(Integer finalPoint) {
        this.point = finalPoint;
    }
}
