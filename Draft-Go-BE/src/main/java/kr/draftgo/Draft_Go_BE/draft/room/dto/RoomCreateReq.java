package kr.draftgo.Draft_Go_BE.draft.room.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 드래프트 방 생성 요청
 */
@Getter
@NoArgsConstructor
public class RoomCreateReq {
    private String title;
    private Integer maxTeamCount;
    private Integer startPrice;
    private Integer startPoint;
    private String thumbnailUrl;
}
