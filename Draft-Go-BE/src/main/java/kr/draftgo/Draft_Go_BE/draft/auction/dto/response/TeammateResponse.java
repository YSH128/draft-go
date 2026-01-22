package kr.draftgo.Draft_Go_BE.draft.auction.dto.response;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeammateResponse {
    private Long memberId;
    private String name;
    private Position position;
    private boolean isLeader;
    private int point; // 낙찰가 (리더는 초기 포인트 혹은 0)

    public static TeammateResponse from(Teammate entity) {
        return TeammateResponse.builder()
                .memberId(entity.getMember().getId())
                .name(entity.getMember().getGameName())
                .position(entity.getPosition())
                .isLeader(entity.getIsLeader())
                .point(entity.getPoint())
                .build();
    }
}
