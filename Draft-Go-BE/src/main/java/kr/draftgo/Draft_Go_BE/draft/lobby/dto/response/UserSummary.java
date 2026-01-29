package kr.draftgo.Draft_Go_BE.draft.lobby.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 사용자 요약 정보 (관전자 등)
 */
@Getter
@Builder
public class UserSummary {
    private Long id;
    private String name;
}
