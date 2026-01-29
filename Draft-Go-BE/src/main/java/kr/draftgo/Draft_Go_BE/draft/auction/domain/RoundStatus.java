package kr.draftgo.Draft_Go_BE.draft.auction.domain;

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
    private Long draftMemberId;
    private int turnOrder;
    private CurrentMemberStatus currentMemberStatus;
    private LocalDateTime startedAt;

    public static RoundStatus start(Long draftId, Long draftMemberId, String playerName) {
        return RoundStatus.builder()
                .draftId(draftId)
                .currentMemberStatus(CurrentMemberStatus.BIDDING)
                .turnOrder(1)
                .draftMemberId(draftMemberId)
                .playerName(playerName)
                .startedAt(LocalDateTime.now())
                .build();
    }
}
