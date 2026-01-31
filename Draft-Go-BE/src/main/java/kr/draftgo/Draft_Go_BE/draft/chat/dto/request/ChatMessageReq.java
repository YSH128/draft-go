package kr.draftgo.Draft_Go_BE.draft.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 채팅 메시지 전송 요청
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageReq {

    /**
     * 메시지 내용 (최대 500자)
     */
    @NotBlank(message = "메시지 내용은 필수입니다")
    @Size(max = 500, message = "메시지는 최대 500자까지 입력 가능합니다")
    private String content;
}
