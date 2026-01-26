package kr.draftgo.Draft_Go_BE.draft.auction.websocket;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionEventType;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import lombok.Builder;
import lombok.Getter;

import lombok.ToString;

@Getter
@Builder
@ToString
public class AuctionEvent {

    private AuctionEventType type;
    private Object data;

    public static AuctionEvent newBidding(RoundStatus state) {
        return AuctionEvent.builder()
                .type(AuctionEventType.NEW_BIDDING)
                .data(state)
                .build();
    }

    public static AuctionEvent bid(Long teamId, int price) {
        return AuctionEvent.builder()
                .type(AuctionEventType.BID)
                .data(new BidInfo(teamId, price))
                .build();
    }

    public static AuctionEvent timeOver(BidInfo bid) {
        return AuctionEvent.builder()
                .type(AuctionEventType.TIME_OVER)
                .data(bid)
                .build();
    }
}
