package kr.draftgo.Draft_Go_BE.draft.auction.websocket;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionState;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuctionEventPublisher {

    private final SimpMessagingTemplate template;

    public void start(Long draftId, AuctionState state) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.start(state));
    }

    public void bidUpdated(Long draftId, Long teamId, int price) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.bid(teamId, price));
    }

    public void ended(Long draftId, BidInfo bid) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.ended(bid));
    }
}
