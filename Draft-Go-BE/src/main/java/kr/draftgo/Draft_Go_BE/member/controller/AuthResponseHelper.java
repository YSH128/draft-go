package kr.draftgo.Draft_Go_BE.member.controller;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.dto.AccessTokenRes;
import kr.draftgo.Draft_Go_BE.member.dto.TokenRes;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * 인증 관련 HTTP 응답 생성 헬퍼
 *
 * RefreshToken 쿠키 설정 및 AccessToken 응답 생성 로직을 공통화합니다.
 */
@Component
@RequiredArgsConstructor
public class AuthResponseHelper {

    private final JwtUtil jwtUtil;

    /**
     * TokenRes를 받아서 RefreshToken은 HttpOnly 쿠키로, AccessToken은 Body로 반환하는 ResponseEntity 생성
     *
     * @param tokenRes Access Token과 Refresh Token을 포함한 TokenRes
     * @return RefreshToken 쿠키가 설정된 ResponseEntity
     */
    public ResponseEntity<AccessTokenRes> createTokenResponse(TokenRes tokenRes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        jwtUtil.createRefreshTokenCookie(tokenRes.getRefreshToken()).toString())
                .body(new AccessTokenRes(tokenRes.getAccessToken()));
    }
}
