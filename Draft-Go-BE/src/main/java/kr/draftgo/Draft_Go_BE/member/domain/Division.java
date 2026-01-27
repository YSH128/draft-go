package kr.draftgo.Draft_Go_BE.member.domain;

import lombok.Getter;

@Getter
public enum Division {
    I("1"),
    II("2"),
    III("3"),
    IV("4");

    private final String displayName;

    Division(String displayName) {
        this.displayName = displayName;
    }

}
