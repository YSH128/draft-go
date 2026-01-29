package kr.draftgo.Draft_Go_BE.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckRes {
    private boolean isDuplicate;
    private String message;

    public static DuplicateCheckRes available(String fieldName) {
        return DuplicateCheckRes.builder()
                .isDuplicate(false)
                .message(fieldName + "은(는) 사용 가능합니다.")
                .build();
    }

    public static DuplicateCheckRes duplicated(String fieldName) {
        return DuplicateCheckRes.builder()
                .isDuplicate(true)
                .message(fieldName + "은(는) 이미 사용 중입니다.")
                .build();
    }
}
