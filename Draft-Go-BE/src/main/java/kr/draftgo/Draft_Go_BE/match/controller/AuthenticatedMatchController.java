package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/v1/match")
@RequiredArgsConstructor
public class AuthenticatedMatchController {

    private final RiotApiService riotApiService;
    private final MemberRepository memberRepository;

    // Changed from /refresh/{puuid} to /refresh/{memberId}
    @PostMapping("/refresh/{memberId}")
    public org.springframework.http.ResponseEntity<String> refreshMatches(@PathVariable Long memberId) {
        log.info("Request match refresh for memberId: {}", memberId);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String result = riotApiService.refreshMatches(member);

        if (result.startsWith("Updated")) {
            member.refreshUpdatedAt();
            memberRepository.save(member);
        }

        return org.springframework.http.ResponseEntity.ok(result);
    }
}
