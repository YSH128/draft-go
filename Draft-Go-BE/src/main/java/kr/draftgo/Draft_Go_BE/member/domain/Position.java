package kr.draftgo.Draft_Go_BE.member.domain;

public enum Position {
    TOP("탑"),
    JUNGLE("정글"),
    MID("미드"),
    BOT("바텀"),
    SUP("서포터"),
    OBSERVER("관전자");

    private final String displayName;

    Position(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
