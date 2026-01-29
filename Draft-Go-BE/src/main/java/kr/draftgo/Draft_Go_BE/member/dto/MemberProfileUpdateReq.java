package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberProfileUpdateReq {
    private Position mainPosition;
    private Position subPosition;
    private String bio;
}
