package kr.draftgo.Draft_Go_BE.draft.room.dto;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 드래프트 방 참가 요청
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomJoinReq {
    private Long draftId;      // 방 ID로 직접 참가 (관리자 재입장용)
    private String draftCode;  // 참여 코드로 참가
    private Position position;
}
