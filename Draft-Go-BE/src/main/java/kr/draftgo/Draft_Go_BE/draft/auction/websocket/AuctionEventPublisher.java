package kr.draftgo.Draft_Go_BE.draft.auction.websocket;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.DraftMemberResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeamInfoResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AuctionEventPublisher {

    private final SimpMessagingTemplate template;

    public void newBidding(Long draftId, RoundStatus state) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.newBidding(state));
    }

    public void bidUpdated(Long draftId, Long teamId, int price) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.bid(teamId, price));
    }

    public void timeOver(Long draftId, BidInfo bid) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.timeOver(bid));
    }

    public void publishDraftQueue(Long draftId, List<DraftMemberResponse> queue) {
        template.convertAndSend("/topic/auction/" + draftId + "/queue", queue);
    }

    public void publishTeamInfo(Long draftId, List<TeamInfoResponse> teams) {
        template.convertAndSend("/topic/auction/" + draftId + "/teams", teams);
    }
}
