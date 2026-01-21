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

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds) {
        // 환경변수에서 받은 secret을 사용하여 Key 생성
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
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
     * @param refreshToken RefreshToken 문자열
     * @return ResponseCookie 객체
     */
    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // 로컬 개발 환경: false, 프로덕션: true
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7일
                .sameSite("Strict")
                .build();
    }
}
