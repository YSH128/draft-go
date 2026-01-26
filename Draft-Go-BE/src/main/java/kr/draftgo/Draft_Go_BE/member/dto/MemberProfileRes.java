package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberProfileRes {
    private Long memberId;
    private String username;
    private String gameName;
    private String tagLine;
    private String puuid;
    private Position mainPosition;
    private Position subPosition;
    private String bio;
    private String profileIconUrl;
    private LocalDateTime updatedAt;
    private MemberStatRes stats;
    private List<MostChampionRes> mostChampions; // Added field

    public static MemberProfileRes from(Member member, MemberStatRes stats, List<MostChampionRes> mostChampions) {
        return MemberProfileRes.builder()
                .memberId(member.getId())
                .username(member.getUsername())
                .gameName(member.getGameName())
                .tagLine(member.getTagLine())
                .puuid(member.getPuuid())
                .mainPosition(member.getMainPosition())
                .subPosition(member.getSubPosition())
                .bio(member.getBio())
                .stats(stats)
                .mostChampions(mostChampions)
                .updatedAt(member.getUpdatedAt())
                .build();
    }

    // Overloaded for backward compatibility or when stats/champs are null
    public static MemberProfileRes from(Member member, MemberStatRes stats) {
        return from(member, stats, null);
    }

    public static MemberProfileRes from(Member member) {
        return from(member, null, null);
    }
}
