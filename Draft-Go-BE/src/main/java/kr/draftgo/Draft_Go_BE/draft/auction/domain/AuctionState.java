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
public class AuctionState implements Serializable {

    private Long draftId;
    private String playerName;
    private Long draftMemberId;
    private Long memberId;
    private int turnOrder;
    private AuctionStatus status;
    private LocalDateTime startedAt;

    public static AuctionState start(Long draftMemberId, String playerName) {
        return AuctionState.builder()
                .draftId(1L) // dummy
                .status(AuctionStatus.BIDDING)
                .turnOrder(1)
                .draftMemberId(draftMemberId)
                .playerName(playerName)
                .memberId(100L) // dummy value
                .startedAt(LocalDateTime.now())
                .build();
    }
}
