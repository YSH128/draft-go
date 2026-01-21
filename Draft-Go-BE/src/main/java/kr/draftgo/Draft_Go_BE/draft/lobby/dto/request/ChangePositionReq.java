package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 포지션 변경 요청
 */
@Getter
@NoArgsConstructor
public class ChangePositionReq {
    private Long targetUserId;
    private Position position;
}
