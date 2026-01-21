package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 역할 변경 요청
 */
@Getter
@NoArgsConstructor
public class ChangeRoleReq {
    private Long targetUserId;
    private String role; // "LEADER" or "MEMBER"
}
