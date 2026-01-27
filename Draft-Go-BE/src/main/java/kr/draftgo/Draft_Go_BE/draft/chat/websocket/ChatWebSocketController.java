package kr.draftgo.Draft_Go_BE.draft.chat.websocket;

import kr.draftgo.Draft_Go_BE.draft.chat.dto.request.ChatMessageRequest;
import kr.draftgo.Draft_Go_BE.draft.chat.service.ChatService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;


/**
 * 채팅 WebSocket Controller
 * 드래프트 단체 채팅 기능 제공
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * 채팅 메시지 전송
     * 클라이언트: SEND /app/chat/{draftId}
     * 브로드캐스트: /topic/chat/{draftId}
     *
     * @param draftId 드래프트 ID
     * @param request 채팅 메시지 요청
     * @param headerAccessor WebSocket 세션 헤더 (세션 속성 접근용)
     */
    @MessageMapping("/chat/{draftId}")
    public void sendMessage(
            @DestinationVariable Long draftId,
            @Payload ChatMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor) {

        // 세션 속성에서 Member 정보 추출
        if (headerAccessor.getSessionAttributes() == null) {
            log.warn("No session attributes - draftId: {}", draftId);
            return;
        }

        Long memberId = (Long) headerAccessor.getSessionAttributes().get("memberId");
        String memberNickname = (String) headerAccessor.getSessionAttributes().get("memberNickname");

        if (memberId == null || memberNickname == null) {
            log.warn("Unauthenticated chat message attempt - draftId: {}", draftId);
            return;
        }

        log.info("Chat message received - draftId: {}, senderId: {}, senderName: {}, content: {}",
                draftId, memberId, memberNickname, request.getContent());

        chatService.broadcastChatMessage(
                draftId,
                memberId,
                memberNickname,
                request.getContent()
        );
    }

    /**
     * 시스템 메시지 전송 (서버에서 호출)
     *
     * @param draftId 드래프트 ID
     * @param content 시스템 메시지 내용
     */
    public void sendSystemMessage(Long draftId, String content) {
        chatService.sendSystemMessage(draftId, content);
    }

    /**
     * 참가자 입장 알림
     *
     * @param draftId 드래프트 ID
     * @param nickname 입장한 사용자 닉네임
     */
    public void sendJoinMessage(Long draftId, String nickname) {
        chatService.sendJoinMessage(draftId, nickname);
    }

    /**
     * 참가자 퇴장 알림
     *
     * @param draftId 드래프트 ID
     * @param nickname 퇴장한 사용자 닉네임
     */
    public void sendLeaveMessage(Long draftId, String nickname) {
        chatService.sendLeaveMessage(draftId, nickname);
    }
}
