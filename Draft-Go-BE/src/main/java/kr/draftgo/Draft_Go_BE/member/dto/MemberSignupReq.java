package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Rank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberSignupReq {
    private String username;
    private String password;
    private String gameName;
    private String tagLine;
    // 아래 필드들은 선택사항 (선택하지 않으면 null)
    private Position mainPosition;
    private Position subPosition;
    private Rank rank;
    private Integer leaguePoint;
}
