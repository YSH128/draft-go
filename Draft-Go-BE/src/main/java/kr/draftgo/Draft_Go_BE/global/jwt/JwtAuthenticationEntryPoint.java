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
 *
 * 주요 처리 케이스:
 * 1. JWT 토큰이 제공되지 않음 (Authorization 헤더 없음)
 * 2. JWT 토큰 검증 실패 후 보호된 리소스 접근 시도 (JwtAuthenticationFilter에서 설정한 에러 정보 사용)
 * 3. 기타 인증 관련 예외
 *
 * Spring Security 필터 체인에서 발생한 인증 예외를 처리합니다.
 * @PreAuthorize, @Secured 등으로 보호된 엔드포인트에 인증 없이 접근할 때 호출됩니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        // JwtAuthenticationFilter에서 설정한 JWT 에러 정보 확인
        ErrorType errorType = (ErrorType) request.getAttribute("jwtErrorType");
        String errorMessage = (String) request.getAttribute("jwtErrorMessage");

        // 케이스 1: JWT 토큰 검증 실패 (만료, 형식 오류 등)
        if (errorType != null) {
            log.warn("[JWT Authentication Failed] Type: {}, Message: '{}', URI: {}, RemoteAddr: {}",
                    errorType, errorMessage, request.getRequestURI(), request.getRemoteAddr());
        }
        // 케이스 2: JWT 토큰이 제공되지 않음
        else {
            log.warn("[Authentication Required] No valid authentication token provided for URI: {}, RemoteAddr: {}",
                    request.getRequestURI(), request.getRemoteAddr());
            errorType = ErrorType.MISSING_TOKEN;
            errorMessage = "인증 토큰이 필요합니다";
        }

        ErrorResponse errorResponse = ErrorResponse.of(errorType, errorMessage);

        response.setStatus(errorType.getHttpStatus().value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
