package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberProfileRes {
    private Long memberId;
    private String username;
    private String gameName;
    private String tagLine;
    private Position mainPosition;
    private Position subPosition;

    public static MemberProfileRes from(Member member) {
        return MemberProfileRes.builder()
                .memberId(member.getId())
                .username(member.getUsername())
                .gameName(member.getGameName())
                .tagLine(member.getTagLine())
                .mainPosition(member.getMainPosition())
                .subPosition(member.getSubPosition())
                .build();
    }
}
