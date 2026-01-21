package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

@Slf4j
@RestController
@RequiredArgsConstructor
public class RiotController {

    private final RiotApiService riotApiService;
    private final kr.draftgo.Draft_Go_BE.member.repository.MemberRepository memberRepository;

    @PostConstruct
    public void init() {
        log.info("RiotController initialized with service: {}", riotApiService.getClass().getName());
    }

    @GetMapping("/api/v1/search/most-champs")
    public java.util.List<kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO> getMostChampions(
            @RequestParam Long memberId,
            @RequestParam(required = false) String seasonId,
            @RequestParam(defaultValue = "10") int limit) {

        return memberRepository.findById(memberId)
                .map(member -> riotApiService.getMostChampions(member.getPuuid(), seasonId, limit))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }
}
