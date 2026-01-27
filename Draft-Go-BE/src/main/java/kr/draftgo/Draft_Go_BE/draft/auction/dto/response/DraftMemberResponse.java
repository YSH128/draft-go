package kr.draftgo.Draft_Go_BE.draft.auction.dto.response;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DraftMemberResponse {
    private Long id;
    private Long memberId;
    private String name;
    private Position position;
    private DraftMemberStatus status;
    private Integer turnOrder;
    private String rank;
    private Integer leaguePoints;

    public static DraftMemberResponse from(DraftMember entity, MemberStat stat) {
        return DraftMemberResponse.builder()
                .id(entity.getId())
                .memberId(entity.getMember().getId())
                .name(entity.getName())
                .position(entity.getPosition())
                .status(entity.getStatus())
                .turnOrder(entity.getTurnOrder())
                .rank(stat != null ? stat.getRank() : null)
                .leaguePoints(stat != null ? stat.getLeaguePoint() : null)
                .build();
    }
}
