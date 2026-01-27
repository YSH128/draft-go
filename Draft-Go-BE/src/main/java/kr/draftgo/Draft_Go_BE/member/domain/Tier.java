package kr.draftgo.Draft_Go_BE.member.domain;

import lombok.Getter;

@Getter
public enum Tier {
    CHALLENGER("챌린저"),
    GRANDMASTER("그랜드마스터"),
    MASTER("마스터"),
    DIAMOND("다이아몬드"),
    EMERALD("에메랄드"),
    PLATINUM("플래티넘"),
    GOLD("골드"),
    SILVER("실버"),
    BRONZE("브론즈"),
    IRON("아이언"),
    UNRANKED("언랭");

    private final String displayName;

    Tier(String displayName) {
        this.displayName = displayName;
    }

}
