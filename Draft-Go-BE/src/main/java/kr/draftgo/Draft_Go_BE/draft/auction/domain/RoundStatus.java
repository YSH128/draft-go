package kr.draftgo.Draft_Go_BE.draft.auction.domain;

import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.ToString;

@Getter
@Builder
@ToString
@AllArgsConstructor
public class RoundStatus implements Serializable {

    private Long draftId;
    private String playerName;
    private String playerProfileImageUrl;
    private Tier tier;
    private Division division;
    private Long draftMemberId;
    private int turnOrder;
    private CurrentMemberStatus currentMemberStatus;
    private LocalDateTime startedAt;

    public static RoundStatus start(Long draftId, Long draftMemberId,
                                    String playerName,
                                    String playerProfileImageUrl,
                                    Tier tier,
                                    Division division) {
        return RoundStatus.builder()
                .draftId(draftId)
                .currentMemberStatus(CurrentMemberStatus.BIDDING)
                .turnOrder(1)
                .draftMemberId(draftMemberId)
                .playerName(playerName)
                .tier(tier)
                .division(division)
                .playerProfileImageUrl(playerProfileImageUrl)
                .startedAt(LocalDateTime.now())
                .build();
    }
}
