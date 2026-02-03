package kr.draftgo.Draft_Go_BE.draft.auction.event;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import lombok.Getter;

/**
 * 경매 WebSocket 이벤트들의 기본 클래스
 * 트랜잭션 커밋 후 WebSocket 브로드캐스트를 위한 이벤트
 */
public abstract class AuctionWebSocketEvent {
    @Getter
    private final Long draftId;

    protected AuctionWebSocketEvent(Long draftId) {
        this.draftId = draftId;
    }

    /**
     * 라운드 시작 이벤트
     */
    @Getter
    public static class RoundStartEvent extends AuctionWebSocketEvent {
        private final RoundStatus roundStatus;

        public RoundStartEvent(Long draftId, RoundStatus roundStatus) {
            super(draftId);
            this.roundStatus = roundStatus;
        }
    }

    /**
     * 입찰 이벤트
     */
    @Getter
    public static class BidEvent extends AuctionWebSocketEvent {
        private final Long teamId;
        private final int price;
        private final Integer remainingSeconds;

        public BidEvent(Long draftId, Long teamId, int price, Integer remainingSeconds) {
            super(draftId);
            this.teamId = teamId;
            this.price = price;
            this.remainingSeconds = remainingSeconds;
        }
    }

    /**
     * 라운드 종료 이벤트
     */
    @Getter
    public static class RoundEndedEvent extends AuctionWebSocketEvent {
        private final BidInfo bidInfo;

        public RoundEndedEvent(Long draftId, BidInfo bidInfo) {
            super(draftId);
            this.bidInfo = bidInfo;
        }
    }

    /**
     * 팀 정보 업데이트 이벤트
     */
    @Getter
    public static class TeamInfoUpdateEvent extends AuctionWebSocketEvent {
        public TeamInfoUpdateEvent(Long draftId) {
            super(draftId);
        }
    }

    /**
     * 대기열 업데이트 이벤트
     */
    @Getter
    public static class QueueUpdateEvent extends AuctionWebSocketEvent {
        public QueueUpdateEvent(Long draftId) {
            super(draftId);
        }
    }
}
