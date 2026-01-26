package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * WebSocket 메시지 인터셉터
 * STOMP 메시지에서 JWT 토큰을 추출하여 인증 처리
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // CONNECT 프레임에서 Authorization 헤더 추출
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            log.info("WebSocket CONNECT - Authorization header: {}", authHeader != null ? "present" : "missing");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    // JWT 토큰 검증
                    if (jwtUtil.validateToken(token)) {
                        String username = jwtUtil.getUsername(token);

                        // Spring Security 인증 객체 생성
                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                        // SecurityContext에 인증 정보 설정
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // STOMP 세션에 사용자 정보 저장
                        accessor.setUser(authentication);

                        log.info("WebSocket authentication successful - username: {}", username);
                    } else {
                        log.warn("WebSocket authentication failed - Invalid token");
                    }
                } catch (Exception e) {
                    log.error("WebSocket authentication error", e);
                }
            } else {
                log.warn("WebSocket CONNECT without Authorization header");
            }
        }

        return message;
    }
}
