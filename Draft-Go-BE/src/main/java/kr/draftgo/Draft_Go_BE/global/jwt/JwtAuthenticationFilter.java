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
 * 요청 헤더에서 JWT 토큰을 추출하고 검증하여 SecurityContext에 인증 정보를 설정합니다.
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
                    }
                } else {
                    // 토큰 검증 실패 시 에러 정보를 요청 속성에 설정
                    request.setAttribute("jwtErrorType", validationResult.getErrorType());
                    request.setAttribute("jwtErrorMessage", validationResult.getErrorMessage());
                    log.debug("JWT validation failed: {}", validationResult.getErrorMessage());
                }
            }
            // 토큰이 없는 경우는 에러로 간주하지 않음 (public endpoint일 수 있음)

        } catch (Exception e) {
            log.error("JWT authentication error: ", e);
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
