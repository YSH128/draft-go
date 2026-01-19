package kr.draftgo.Draft_Go_BE.member.event;

import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MemberLoginEvent {
    private final Member member;
}
