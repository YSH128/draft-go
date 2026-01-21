package kr.draftgo.Draft_Go_BE.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 인증되지 않은 사용자가 보호된 리소스에 접근할 때 호출되는 EntryPoint
 * Spring Security 필터 체인에서 발생한 인증 예외를 처리합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        log.warn("Unauthorized access attempt to protected resource: {}", request.getRequestURI());

        // 요청 속성에서 JWT 관련 에러 타입 확인
        ErrorType errorType = (ErrorType) request.getAttribute("jwtErrorType");
        String errorMessage = (String) request.getAttribute("jwtErrorMessage");

        // 에러 타입이 없으면 토큰이 제공되지 않은 것으로 간주
        if (errorType == null) {
            errorType = ErrorType.MISSING_TOKEN;
            errorMessage = "인증 토큰이 필요합니다";
        }

        ErrorResponse errorResponse = ErrorResponse.of(errorType, errorMessage);

        response.setStatus(errorType.getHttpStatus().value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
