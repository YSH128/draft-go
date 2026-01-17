package kr.draftgo.Draft_Go_BE.member.controller;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody MemberSignupReq req) {
        memberService.signup(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AccessTokenRes> login(@RequestBody MemberLoginReq req) {
        TokenRes tokenRes = memberService.login(req);
        return createTokenResponse(tokenRes);
    }

    @PostMapping("/reissue")
    public ResponseEntity<AccessTokenRes> reissue(@CookieValue("refreshToken") String refreshToken) {
        TokenRes tokenRes = memberService.reissue(refreshToken);
        return createTokenResponse(tokenRes);
    }

    @PutMapping("/{memberId}/profile")
    public ResponseEntity<Void> updateProfile(@PathVariable Long memberId, @RequestBody MemberProfileUpdateReq req) {
        memberService.updateProfile(memberId, req);
        return ResponseEntity.ok().build();
    }

    private ResponseEntity<AccessTokenRes> createTokenResponse(TokenRes tokenRes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtil.createRefreshTokenCookie(tokenRes.getRefreshToken()).toString())
                .body(new AccessTokenRes(tokenRes.getAccessToken()));
    }
}
