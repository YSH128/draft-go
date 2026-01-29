package kr.draftgo.Draft_Go_BE.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 인증된 사용자가 권한이 없는 리소스에 접근할 때 호출되는 Handler
 *
 * 주요 처리 케이스:
 * 1. JWT 토큰 검증 실패 (만료, 형식 오류 등) - JwtAuthenticationFilter에서 설정한 에러 정보 사용
 * 2. 인증은 성공했으나 권한 부족 (예: USER 권한으로 ADMIN 리소스 접근)
 *
 * Spring Security 필터 체인에서 발생하는 AccessDeniedException을 처리합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        // JwtAuthenticationFilter에서 설정한 JWT 에러 정보 확인
        ErrorType errorType = (ErrorType) request.getAttribute("jwtErrorType");
        String errorMessage = (String) request.getAttribute("jwtErrorMessage");

        ErrorResponse errorResponse;
        int statusCode;

        // 케이스 1: JWT 토큰 관련 에러 (만료, 형식 오류, 서명 오류 등)
        if (errorType != null) {
            log.warn("[JWT Error] Type: {}, Message: '{}', URI: {}, RemoteAddr: {}",
                    errorType, errorMessage, request.getRequestURI(), request.getRemoteAddr());
            errorResponse = ErrorResponse.of(errorType, errorMessage);
            statusCode = errorType.getHttpStatus().value();
        }
        // 케이스 2: 순수한 권한 부족 에러 (인증은 성공했지만 해당 리소스 접근 권한 없음)
        else {
            String username = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous";
            log.warn("[Access Denied] User '{}' attempted to access '{}' without sufficient permissions. RemoteAddr: {}",
                    username, request.getRequestURI(), request.getRemoteAddr());
            errorResponse = ErrorResponse.of(
                    ErrorType.ACCESS_DENIED,
                    "해당 리소스에 접근할 권한이 없습니다"
            );
            statusCode = HttpServletResponse.SC_FORBIDDEN;
        }

        response.setStatus(statusCode);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
