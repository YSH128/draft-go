package kr.draftgo.Draft_Go_BE.draft.auction.redis;

public class AuctionKey {

    public static String current(Long draftId) {
        return "auction:" + draftId + ":current";
    }

    public static String bid(Long draftId) {
        return "auction:" + draftId + ":bid";
    }

    public static String timer(Long draftId) {
        return "auction:" + draftId + ":timer";
    }
}
