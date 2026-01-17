package kr.draftgo.Draft_Go_BE.member.domain;

public enum Rank {
    // 상위 티어
    CHALLENGER("챌린저"),
    GRANDMASTER("그랜드마스터"),
    MASTER("마스터"),

    // 다이아몬드
    DIAMOND_1("다이아몬드 1"),
    DIAMOND_2("다이아몬드 2"),
    DIAMOND_3("다이아몬드 3"),
    DIAMOND_4("다이아몬드 4"),

    // 에메랄드
    EMERALD_1("에메랄드 1"),
    EMERALD_2("에메랄드 2"),
    EMERALD_3("에메랄드 3"),
    EMERALD_4("에메랄드 4"),

    // 플래티넘
    PLATINUM_1("플래티넘 1"),
    PLATINUM_2("플래티넘 2"),
    PLATINUM_3("플래티넘 3"),
    PLATINUM_4("플래티넘 4"),

    // 골드
    GOLD_1("골드 1"),
    GOLD_2("골드 2"),
    GOLD_3("골드 3"),
    GOLD_4("골드 4"),

    // 실버
    SILVER_1("실버 1"),
    SILVER_2("실버 2"),
    SILVER_3("실버 3"),
    SILVER_4("실버 4"),

    // 브론즈
    BRONZE_1("브론즈 1"),
    BRONZE_2("브론즈 2"),
    BRONZE_3("브론즈 3"),
    BRONZE_4("브론즈 4"),

    // 아이언
    IRON_1("아이언 1"),
    IRON_2("아이언 2"),
    IRON_3("아이언 3"),
    IRON_4("아이언 4"),

    // 미정의 랭크
    UNRANKED("미정의");

    private final String displayName;

    Rank(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
