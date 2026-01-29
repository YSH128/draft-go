package kr.draftgo.Draft_Go_BE.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 테스트 멤버 추가 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTestMembersRes {
    private Long draftId;
    private Integer addedCount;
    private List<String> addedMembers;
    private String message;
}
