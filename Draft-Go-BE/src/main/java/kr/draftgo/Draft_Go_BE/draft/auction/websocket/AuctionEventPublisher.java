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

    public void roundStart(Long draftId, RoundStatus state) {
        // 라운드 시작을 알리며, 현재 플레이어 정보, 종료 여부 등을 전달합니다.
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.roundStart(state));
    }

    public void bidUpdated(Long draftId, Long teamId, int price, Integer remainingSeconds) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.bid(teamId, price, remainingSeconds));
    }

    public void roundEnded(Long draftId, BidInfo bid) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.roundEnded(bid));
    }

    public void auctionEnded(Long draftId) {
        template.convertAndSend(
                "/ws/auction/" + draftId,
                AuctionEvent.auctionEnded(draftId));
    }

    public void publishDraftQueue(Long draftId, List<DraftMemberResponse> queue) {
        template.convertAndSend("/topic/auction/" + draftId + "/queue", queue);
    }

    public void publishTeamInfo(Long draftId, List<TeamInfoResponse> teams) {
        template.convertAndSend("/topic/auction/" + draftId + "/teams", teams);
    }
}
