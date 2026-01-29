package kr.draftgo.Draft_Go_BE.draft.auction.domain;

/**
 * 경매의 전체 진행 상태를 나타내는 Enum
 */
public enum AuctionPhase {
    /**
     * 경매 시작 전 (LOBBY 상태)
     */
    NOT_STARTED,

    /**
     * 경매 진행 중 (타이머가 동작하고 있음)
     */
    IN_PROGRESS,

    /**
     * 경매 중단됨 (IN_DRAFT 상태이지만 Redis에 타이머가 없음)
     */
    INTERRUPTED,

    /**
     * 경매 완료됨 (COMPLETED 상태)
     */
    COMPLETED
}
