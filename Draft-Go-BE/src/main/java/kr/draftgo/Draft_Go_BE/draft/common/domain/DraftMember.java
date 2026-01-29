package kr.draftgo.Draft_Go_BE.draft.common.domain;

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
@Table(name = "draft_member")
public class DraftMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_id", nullable = false)
    private Draft draft;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Position position;

    @Column
    private Integer turnOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DraftMemberStatus status;

    @Builder
    public DraftMember(Draft draft, Member member, Position position) {
        this.draft = draft;
        this.member = member;
        this.position = position;
        this.status = DraftMemberStatus.WAITING;
    }


    public void complete() {
        this.status = DraftMemberStatus.COMPLETED;
    }

    public void skip() {
        this.status = DraftMemberStatus.SKIPPED;
    }

    public void assignTurnOrder(int turnOrder) {
        this.turnOrder = turnOrder;
    }

    public String getName() {
        return member.getGameName();
    }
}
