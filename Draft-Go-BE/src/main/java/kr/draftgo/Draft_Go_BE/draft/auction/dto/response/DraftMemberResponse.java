package kr.draftgo.Draft_Go_BE.draft.auction.dto.response;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus;
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

    public static DraftMemberResponse from(DraftMember entity) {
        return DraftMemberResponse.builder()
                .id(entity.getId())
                .memberId(entity.getMember().getId())
                .name(entity.getName())
                .position(entity.getPosition())
                .status(entity.getStatus())
                .turnOrder(entity.getTurnOrder())
                .build();
    }
}
