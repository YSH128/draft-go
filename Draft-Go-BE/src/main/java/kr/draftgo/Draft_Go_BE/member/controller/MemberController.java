package kr.draftgo.Draft_Go_BE.member.controller;

import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<MemberProfileRes> signup(@Valid @RequestBody MemberSignupReq req) {
        MemberProfileRes memberRes = memberService.signup(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(memberRes);
    }

    @PostMapping("/login")
    public ResponseEntity<AccessTokenRes> login(@Valid @RequestBody MemberLoginReq req) {
        TokenRes tokenRes = memberService.login(req);
        return createTokenResponse(tokenRes);
    }

    @PostMapping("/reissue")
    public ResponseEntity<AccessTokenRes> reissue(@CookieValue("refreshToken") String refreshToken) {
        TokenRes tokenRes = memberService.reissue(refreshToken);
        return createTokenResponse(tokenRes);
    }

    @GetMapping("/me")
    public ResponseEntity<MemberProfileRes> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        MemberProfileRes profile = memberService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        String username = authentication.getName();
        memberService.logout(username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{memberId}/profile")
    public ResponseEntity<Void> updateProfile(@PathVariable Long memberId, @RequestBody MemberProfileUpdateReq req) {
        memberService.updateProfile(memberId, req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/username")
    public ResponseEntity<DuplicateCheckRes> checkDuplicateUsername(@RequestParam String username) {
        DuplicateCheckRes response = memberService.checkDuplicateUsername(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/summoner")
    public ResponseEntity<DuplicateCheckRes> checkDuplicateSummonerName(
            @RequestParam String gameName,
            @RequestParam String tagLine) {
        DuplicateCheckRes response = memberService.checkDuplicateSummonerName(gameName, tagLine);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<AccessTokenRes> createTokenResponse(TokenRes tokenRes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtil.createRefreshTokenCookie(tokenRes.getRefreshToken()).toString())
                .body(new AccessTokenRes(tokenRes.getAccessToken()));
    }
}
