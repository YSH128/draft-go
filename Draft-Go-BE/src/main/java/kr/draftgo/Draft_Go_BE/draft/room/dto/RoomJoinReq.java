package kr.draftgo.Draft_Go_BE.draft.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "방 ID (관리자 재입장용, draftCode와 둘 중 하나만 필요)")
    private Long draftId;

    @Schema(description = "참여 코드 (팀원 코드 또는 팀장 코드)")
    private String draftCode;

    @Schema(description = "포지션 (TOP, JUNGLE, MID, BOT, SUP, OBSERVER). 팀장 코드로 입장 시 필수이며 OBSERVER는 불가. 생략 시 OBSERVER로 자동 설정")
    private Position position;
}
