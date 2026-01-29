package kr.draftgo.Draft_Go_BE.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 인증 필터
 *
 * 요청 헤더에서 JWT 토큰을 추출하고 검증하여 SecurityContext에 인증 정보를 설정합니다.
 *
 * 처리 흐름:
 * 1. Authorization 헤더에서 JWT 토큰 추출
 * 2. 토큰이 있으면 검증 수행
 *    - 성공: SecurityContext에 인증 정보 설정 → 정상 처리
 *    - 실패: request에 에러 정보 설정 → 후속 필터에서 EntryPoint/AccessDeniedHandler 호출
 * 3. 토큰이 없으면 인증 정보 설정 안 함
 *    - 공개 API: 정상 처리
 *    - 보호된 API: AuthenticationEntryPoint 호출
 *
 * 주의: 이 필터는 예외를 던지지 않습니다.
 * JWT 검증 실패 시 request attribute에 에러 정보만 설정하고,
 * 실제 예외 처리는 JwtAuthenticationEntryPoint와 JwtAccessDeniedHandler가 담당합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = resolveToken(request);

            if (token != null) {
                // 토큰 검증 및 타입 확인
                JwtValidationResult validationResult = jwtUtil.validateTokenWithDetails(token);

                if (validationResult.isValid()) {
                    // 토큰이 유효한 경우 인증 정보 설정
                    String username = jwtUtil.getUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (userDetails != null) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Successfully authenticated user: {}", username);
                    }
                } else {
                    // 토큰이 유효하지 않은 경우 에러 정보를 요청 속성에 설정
                    // 이 정보는 보호된 리소스 접근 시 EntryPoint/AccessDeniedHandler에서 사용됨
                    request.setAttribute("jwtErrorType", validationResult.getErrorType());
                    request.setAttribute("jwtErrorMessage", validationResult.getErrorMessage());
                    log.debug("JWT validation failed: {} - {}", validationResult.getErrorType(), validationResult.getErrorMessage());
                }
            }
            // 토큰이 없는 경우:
            // - 공개 API는 정상적으로 통과
            // - 보호된 API는 AuthenticationEntryPoint에서 처리

        } catch (Exception e) {
            // 예상치 못한 예외 발생 시 에러 정보 설정
            log.error("Unexpected error during JWT authentication: ", e);
            request.setAttribute("jwtErrorType", ErrorType.INVALID_TOKEN);
            request.setAttribute("jwtErrorMessage", "토큰 처리 중 오류가 발생했습니다");
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
