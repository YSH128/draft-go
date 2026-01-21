package kr.draftgo.Draft_Go_BE.draft.domain;

import jakarta.persistence.*;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "draft")
public class Draft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member owner;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false)
    private Integer startPrice;

    @Column(nullable = false)
    private Integer startPoint;

    @Column(nullable = false, length = 6)
    private String memberCode;

    @Column(nullable = false, length = 6)
    private String leaderCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DraftStatus status;

    @Builder
    public Draft(Member owner, String title, Integer startPrice, Integer startPoint) {
        this.owner = owner;
        this.title = title;
        this.startPrice = startPrice;
        this.startPoint = startPoint;
        this.status = DraftStatus.RECRUITING;
        // Generate random 6-char codes
        this.memberCode = UUID.randomUUID().toString().substring(0, 6);
        this.leaderCode = UUID.randomUUID().toString().substring(0, 6);
    }
}
