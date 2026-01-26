package kr.draftgo.Draft_Go_BE.draft.auction.dto;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuctionStatusResponse {
    private RoundStatus state;
    private BidInfo currentBid;
    private String nextPlayerName;

    public static AuctionStatusResponse of(RoundStatus state, BidInfo bid, String nextPlayerName) {
        return AuctionStatusResponse.builder()
                .state(state)
                .currentBid(bid)
                .nextPlayerName(nextPlayerName)
                .build();
    }
}
