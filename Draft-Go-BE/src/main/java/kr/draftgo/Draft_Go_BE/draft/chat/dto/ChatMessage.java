package kr.draftgo.Draft_Go_BE.draft.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /**
     * 메시지 타입
     */
    private MessageType type;

    /**
     * 발신자 ID
     */
    private Long senderId;

    /**
     * 발신자 닉네임
     */
    private String senderNickname;

    /**
     * 메시지 내용
     */
    private String content;

    /**
     * 전송 시간
     */
    private LocalDateTime timestamp;

    /**
     * 메시지 타입
     */
    public enum MessageType {
        CHAT,      // 일반 채팅
        JOIN,      // 입장 알림
        LEAVE,     // 퇴장 알림
        SYSTEM     // 시스템 메시지
    }
}
