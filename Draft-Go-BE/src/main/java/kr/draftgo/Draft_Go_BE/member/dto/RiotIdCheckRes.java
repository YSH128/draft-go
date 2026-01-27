package kr.draftgo.Draft_Go_BE.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiotIdCheckRes {
    private boolean exists;
    private String message;

    public static RiotIdCheckRes available() {
        return RiotIdCheckRes.builder()
                .exists(true)
                .message("사용 가능한 Riot 계정입니다.")
                .build();
    }

    public static RiotIdCheckRes unavailable(String message) {
        return RiotIdCheckRes.builder()
                .exists(false)
                .message(message)
                .build();
    }
}
