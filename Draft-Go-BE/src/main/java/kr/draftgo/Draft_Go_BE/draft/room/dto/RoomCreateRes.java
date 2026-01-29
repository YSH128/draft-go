package kr.draftgo.Draft_Go_BE.draft.room.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 드래프트 방 생성 응답
 */
@Getter
@Builder
public class RoomCreateRes {
    private Long draftId;
    private String teamMemberCode;
    private String teamLeaderCode;
}
