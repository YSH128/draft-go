package kr.draftgo.Draft_Go_BE.draft.lobby.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 팀장 포인트 등록 요청
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SetLeaderPointReq {
    private Long leaderId;
    private Integer point;
}
