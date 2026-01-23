package kr.draftgo.Draft_Go_BE.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 API 컨트롤러
 *
 * 회원가입, 로그인, 로그아웃, 토큰 재발급 등 인증/인가 관련 엔드포인트를 제공합니다.
 */
@Tag(name = "Auth", description = "인증/인가 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthResponseHelper authResponseHelper;
    private final JwtUtil jwtUtil;

    @Operation(summary = "회원가입", description = "새로운 회원을 등록하고 자동으로 로그인하여 토큰을 발급합니다.")
    @PostMapping("/signup")
    public ResponseEntity<AccessTokenRes> signup(@Valid @RequestBody MemberSignupReq req) {
        TokenRes tokenRes = authService.signup(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(authResponseHelper.createTokenResponse(tokenRes).getHeaders())
                .body(new AccessTokenRes(tokenRes.getAccessToken()));
    }

    @Operation(summary = "로그인", description = "회원 로그인을 수행하고 토큰을 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<AccessTokenRes> login(@Valid @RequestBody MemberLoginReq req) {
        TokenRes tokenRes = authService.login(req);
        return authResponseHelper.createTokenResponse(tokenRes);
    }

    @Operation(summary = "로그아웃", description = "회원 로그아웃을 수행하고 RefreshToken 쿠키를 삭제합니다.")
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(Authentication authentication) {
        String username = authentication.getName();
        authService.logout(username);

        // RefreshToken 쿠키 삭제
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtil.deleteRefreshTokenCookie().toString())
                .build();
    }

    @Operation(summary = "토큰 재발급", description = "Refresh Token을 사용하여 Access Token을 재발급합니다.")
    @PostMapping("/reissue")
    public ResponseEntity<AccessTokenRes> reissue(@CookieValue("refreshToken") String refreshToken) {
        TokenRes tokenRes = authService.reissue(refreshToken);
        return authResponseHelper.createTokenResponse(tokenRes);
    }
}
