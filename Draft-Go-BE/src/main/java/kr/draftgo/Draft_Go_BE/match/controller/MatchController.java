package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Match", description = "전적 관리 및 갱신 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/match")
@RequiredArgsConstructor
public class MatchController {

    private final RiotApiService riotApiService;
    private final MemberRepository memberRepository;
    private final MemberService memberService;

    // Changed from /refresh/{puuid} to /refresh/{memberId}
    @Operation(summary = "전적 수동 갱신", description = "특정 회원의 전적을 Riot API로부터 수동으로 갱신합니다.")
    @PostMapping("/refresh/{memberId}")
    public ResponseEntity<String> refreshMatches(@PathVariable Long memberId) {
        log.info("Request match refresh for memberId: {}", memberId);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String result = riotApiService.refreshMatches(member);

        if (result.startsWith("Updated")) {
            member.refreshUpdatedAt();
            memberRepository.save(member);
            memberService.updateMemberStats(memberId);
        }

        return ResponseEntity.ok(result);
    }
}
