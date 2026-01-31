package kr.draftgo.Draft_Go_BE.draft.auction.websocket;

import kr.draftgo.Draft_Go_BE.draft.auction.dto.event.AuctionEventType;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.event.BidEventDto;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.event.RoundStartEventDto;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.event.RoundEndedEventDto;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class AuctionEvent {

    private AuctionEventType type;
    private Object data;

    public static AuctionEvent roundStart(RoundStatus status) {
        return AuctionEvent.builder()
                .type(AuctionEventType.ROUND_START)
                .data(RoundStartEventDto.builder()
                        .draftId(status.getDraftId())
                        .draftMemberId(status.getDraftMemberId())
                        .playerName(status.getPlayerName())
                        .playerProfileImageUrl(status.getPlayerProfileImageUrl())
                        .tier(status.getTier())
                        .division(status.getDivision())
                        .position(status.getPosition())
                        .mainPosition(status.getMainPosition())
                        .subPosition(status.getSubPosition())
                        .mostChampions(status.getMostChampions())
                        .turnOrder(status.getTurnOrder())
                        .currentMemberStatus(status.getCurrentMemberStatus())
                        .build())
                .build();
    }

    public static AuctionEvent bid(Long teamId, int price, Integer remainingSeconds) {
        return AuctionEvent.builder()
                .type(AuctionEventType.BID)
                .data(BidEventDto.builder()
                        .teamId(teamId)
                        .price(price)
                        .remainingSeconds(remainingSeconds)
                        .build())
                .build();
    }

    public static AuctionEvent roundEnded(BidInfo bid) {
        return AuctionEvent.builder()
                .type(AuctionEventType.ROUND_ENDED)
                .data(bid.exists()
                        ? RoundEndedEventDto.successful(bid.getTeamId(), bid.getPrice())
                        : RoundEndedEventDto.skipped())
                .build();
    }
}
