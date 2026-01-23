package kr.draftgo.Draft_Go_BE.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final long refreshTokenValidityInSeconds; // 쿠키 maxAge용

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds) {
        // 환경변수에서 받은 secret을 사용하여 Key 생성
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInSeconds = refreshTokenValidityInSeconds; // 쿠키 maxAge용 (초 단위)
    }

    public String createAccessToken(String username) {
        return createToken(username, accessTokenValidityInMilliseconds);
    }

    public String createRefreshToken(String username) {
        return createToken(username, refreshTokenValidityInMilliseconds);
    }

    private String createToken(String subject, long validityInMilliseconds) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 토큰 검증 (boolean 반환, 하위 호환성 유지)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT Token", e);
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }

    /**
     * 토큰 검증 및 상세 결과 반환
     */
    public JwtValidationResult validateTokenWithDetails(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return JwtValidationResult.success();
        } catch (io.jsonwebtoken.security.SecurityException e) {
            log.info("Invalid JWT signature", e);
            return JwtValidationResult.failure(ErrorType.INVALID_TOKEN, "토큰 서명이 유효하지 않습니다");
        } catch (MalformedJwtException e) {
            log.info("Invalid JWT token", e);
            return JwtValidationResult.failure(ErrorType.INVALID_TOKEN, "토큰 형식이 올바르지 않습니다");
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT token", e);
            return JwtValidationResult.failure(ErrorType.EXPIRED_TOKEN, "토큰이 만료되었습니다");
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT token", e);
            return JwtValidationResult.failure(ErrorType.INVALID_TOKEN, "지원하지 않는 토큰 형식입니다");
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty", e);
            return JwtValidationResult.failure(ErrorType.INVALID_TOKEN, "토큰이 비어있습니다");
        }
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * RefreshToken을 쿠키로 생성합니다.
     *
     * Path를 /api/v1/members로 제한하여 회원 관련 API에서만 쿠키가 전송되도록 합니다.
     * 이를 통해 다른 경로에서의 불필요한 쿠키 전송을 방지하고 보안을 강화합니다.
     *
     * @param refreshToken RefreshToken 문자열
     * @return ResponseCookie 객체
     */
    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // 로컬 개발 환경: false, 프로덕션: true
                .path("/api/v1/members") // 회원 관련 API로 경로 제한
                .maxAge(refreshTokenValidityInSeconds) // 초 단위로 정확한 만료 시간 설정
                .sameSite("Lax") // Lax로 설정하여 일반적인 탐색에서도 쿠키 전송 허용
                .build();
    }

    /**
     * RefreshToken 쿠키를 삭제합니다. (로그아웃 시 사용)
     *
     * maxAge를 0으로 설정하여 브라우저가 쿠키를 즉시 삭제하도록 합니다.
     *
     * @return ResponseCookie 객체 (삭제용)
     */
    public ResponseCookie deleteRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // 로컬 개발 환경: false, 프로덕션: true
                .path("/api/v1/members") // 생성 시와 동일한 경로
                .maxAge(0) // 즉시 삭제
                .sameSite("Lax") // 생성 시와 동일한 설정
                .build();
    }
}
