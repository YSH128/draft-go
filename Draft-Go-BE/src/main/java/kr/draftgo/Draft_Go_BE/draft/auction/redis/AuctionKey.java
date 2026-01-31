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

    public static String teamPoint(Long draftId, Long teamId) {
        return "draft:" + draftId + ":team:" + teamId + ":point";
    }

    public static String teamLeader(Long draftId, Long teamId) {
        return "draft:" + draftId + ":team:" + teamId + ":leader";
    }

    public static String teamPositions(Long draftId, Long teamId) {
        return "draft:" + draftId + ":team:" + teamId + ":positions";
    }
}
