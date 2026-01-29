package kr.draftgo.Draft_Go_BE.draft.chat.service;

import kr.draftgo.Draft_Go_BE.draft.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 채팅 서비스
 * 채팅 메시지 브로드캐스트 및 알림 전송
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 채팅 메시지 브로드캐스트
     *
     * @param draftId 드래프트 ID
     * @param senderId 발신자 ID
     * @param senderNickname 발신자 닉네임
     * @param content 메시지 내용
     */
    public void broadcastChatMessage(Long draftId, Long senderId, String senderNickname, String content) {
        ChatMessage chatMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.CHAT)
                .senderId(senderId)
                .senderNickname(senderNickname)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/chat/" + draftId;
        messagingTemplate.convertAndSend(destination, chatMessage);

        log.info("Chat message broadcasted - destination: {}, sender: {}, content: {}",
                destination, senderNickname, content);
    }

    /**
     * 시스템 메시지 전송
     *
     * @param draftId 드래프트 ID
     * @param content 시스템 메시지 내용
     */
    public void sendSystemMessage(Long draftId, String content) {
        ChatMessage systemMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.SYSTEM)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/chat/" + draftId;
        messagingTemplate.convertAndSend(destination, systemMessage);

        log.info("System message sent - draftId: {}, content: {}", draftId, content);
    }

    /**
     * 참가자 입장 알림
     *
     * @param draftId 드래프트 ID
     * @param nickname 입장한 사용자 닉네임
     */
    public void sendJoinMessage(Long draftId, String nickname) {
        ChatMessage joinMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.JOIN)
                .senderNickname(nickname)
                .content(nickname + "님이 입장했습니다.")
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/chat/" + draftId;
        messagingTemplate.convertAndSend(destination, joinMessage);

        log.info("Join message sent - draftId: {}, nickname: {}", draftId, nickname);
    }

    /**
     * 참가자 퇴장 알림
     *
     * @param draftId 드래프트 ID
     * @param nickname 퇴장한 사용자 닉네임
     */
    public void sendLeaveMessage(Long draftId, String nickname) {
        ChatMessage leaveMessage = ChatMessage.builder()
                .type(ChatMessage.MessageType.LEAVE)
                .senderNickname(nickname)
                .content(nickname + "님이 퇴장했습니다.")
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/chat/" + draftId;
        messagingTemplate.convertAndSend(destination, leaveMessage);

        log.info("Leave message sent - draftId: {}, nickname: {}", draftId, nickname);
    }
}
