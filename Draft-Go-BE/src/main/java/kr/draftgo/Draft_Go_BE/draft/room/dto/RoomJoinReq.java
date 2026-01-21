package kr.draftgo.Draft_Go_BE.draft.room.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 드래프트 방 참가 요청
 */
@Getter
@NoArgsConstructor
public class RoomJoinReq {
    private String draftCode;
    private Position position;
}
