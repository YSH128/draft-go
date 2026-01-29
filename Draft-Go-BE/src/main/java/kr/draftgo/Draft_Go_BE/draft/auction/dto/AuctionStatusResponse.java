package kr.draftgo.Draft_Go_BE.draft.auction.dto;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionPhase;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuctionStatusResponse {
    private AuctionPhase auctionPhase;  // 경매 전체 진행 상태
    private Integer remainingTime;      // 남은 시간 (초), 타이머가 없으면 null
    private RoundStatus state;          // 현재 라운드 상태
    private BidInfo currentBid;         // 현재 입찰 정보
    private String nextPlayerName;      // 다음 선수 이름

    public static AuctionStatusResponse of(AuctionPhase auctionPhase, Integer remainingTime,
                                          RoundStatus state, BidInfo bid, String nextPlayerName) {
        return AuctionStatusResponse.builder()
                .auctionPhase(auctionPhase)
                .remainingTime(remainingTime)
                .state(state)
                .currentBid(bid)
                .nextPlayerName(nextPlayerName)
                .build();
    }
}
