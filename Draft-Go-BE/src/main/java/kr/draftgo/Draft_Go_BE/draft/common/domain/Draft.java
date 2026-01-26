package kr.draftgo.Draft_Go_BE.draft.common.domain;

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

    @Column(nullable = false)
    private Integer maxTeamCount;

    @Column(nullable = false, length = 6)
    private String memberCode;

    @Column(nullable = false, length = 6)
    private String leaderCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DraftStatus status;

    @Builder
    public Draft(Member owner, String title, Integer startPrice, Integer startPoint, Integer maxTeamCount) {
        this.owner = owner;
        this.title = title;
        this.startPrice = startPrice;
        this.startPoint = startPoint;
        this.status = DraftStatus.LOBBY;
        this.maxTeamCount = maxTeamCount;
        // Generate random 6-char codes
        this.memberCode = UUID.randomUUID().toString().substring(0, 6);
        this.leaderCode = UUID.randomUUID().toString().substring(0, 6);
    }

    public void startDraft() {
        this.status = DraftStatus.IN_DRAFT;
    }

    public void refreshMemberCode() {
        this.memberCode = UUID.randomUUID().toString().substring(0, 6);
    }

    public void refreshLeaderCode() {
        this.leaderCode = UUID.randomUUID().toString().substring(0, 6);
    }

    /**
     * 드래프트 제목 수정
     */
    public void updateTitle(String title) {
        if (title != null) {
            this.title = title;
        }
    }

    /**
     * 시작 가격 수정
     */
    public void updateStartPrice(Integer startPrice) {
        if (startPrice != null) {
            this.startPrice = startPrice;
        }
    }

    /**
     * 시작 포인트 수정
     */
    public void updateStartPoint(Integer startPoint) {
        if (startPoint != null) {
            this.startPoint = startPoint;
        }
    }

    /**
     * 최대 팀 수 수정
     */
    public void updateMaxTeamCount(Integer maxTeamCount) {
        if (maxTeamCount != null) {
            this.maxTeamCount = maxTeamCount;
        }
    }

    /**
     * 드래프트 정보 수정 (null이 아닌 값만 업데이트)
     */
    public void updateDraftInfo(String title, Integer startPrice, Integer startPoint, Integer maxTeamCount) {
        updateTitle(title);
        updateStartPrice(startPrice);
        updateStartPoint(startPoint);
        updateMaxTeamCount(maxTeamCount);
    }
}

