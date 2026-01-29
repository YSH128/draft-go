package kr.draftgo.Draft_Go_BE.member.controller;

import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 회원 정보 관리 API 컨트롤러
 *
 * 회원 정보 조회, 프로필 수정, 중복 확인 등 회원 데이터 관련 엔드포인트를 제공합니다.
 */
@Tag(name = "Member", description = "회원 정보 관리 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "내 정보 조회 (상세)", description = "현재 로그인한 회원의 정보를 조회합니다. (전적/통계 포함)")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MemberProfileRes> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        MemberProfileRes profile = memberService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @Operation(summary = "회원 정보 조회 (상세)", description = "특정 회원의 정보를 조회합니다. (전적/통계 포함)")
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberProfileRes> getMemberProfile(@PathVariable Long memberId) {
        MemberProfileRes profile = memberService.getProfileById(memberId);
        return ResponseEntity.ok(profile);
    }

    @Operation(summary = "프로필 수정", description = "회원의 프로필 정보를 수정합니다.")
    @PutMapping("/{memberId}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateProfile(@PathVariable Long memberId, @RequestBody MemberProfileUpdateReq req) {
        memberService.updateProfile(memberId, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "아이디 중복 확인", description = "아이디 중복 여부를 확인합니다.")
    @GetMapping("/check/username")
    public ResponseEntity<DuplicateCheckRes> checkDuplicateUsername(@RequestParam String username) {
        DuplicateCheckRes response = memberService.checkDuplicateUsername(username);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "소환사명 중복 확인", description = "소환사명 중복 여부를 확인합니다.")
    @GetMapping("/check/summoner")
    public ResponseEntity<DuplicateCheckRes> checkDuplicateSummonerName(
            @RequestParam String gameName,
            @RequestParam String tagLine) {
        DuplicateCheckRes response = memberService.checkDuplicateSummonerName(gameName, tagLine);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Riot ID 실존 확인", description = "Riot API를 통해 해당 계정이 실존하는지 확인합니다.")
    @GetMapping("/check/riot-id")
    public ResponseEntity<kr.draftgo.Draft_Go_BE.member.dto.RiotIdCheckRes> checkRiotId(
            @RequestParam String gameName,
            @RequestParam String tagLine) {
        kr.draftgo.Draft_Go_BE.member.dto.RiotIdCheckRes response = memberService.checkRiotId(gameName, tagLine);
        return ResponseEntity.ok(response);
    }
}
