package kr.draftgo.Draft_Go_BE.match.controller;

import java.util.List;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

@Tag(name = "Riot Search", description = "Riot 데이터 조회 API")
@Slf4j
@RestController
@RequiredArgsConstructor
public class RiotController {

    private final RiotApiService riotApiService;
    private final MemberRepository memberRepository;

    @PostConstruct
    public void init() {
        log.info("RiotController initialized with service: {}", riotApiService.getClass().getName());
    }

    @Operation(summary = "모스트 챔피언 조회", description = "특정 회원의 시즌별 모스트 챔피언 목록을 조회합니다.")
    @GetMapping("/api/v1/search/most-champs")
    public List<MostChampionDTO> getMostChampions(
            @RequestParam Long memberId,
            @RequestParam(required = false) String seasonId,
            @RequestParam(defaultValue = "10") int limit) {

        return memberRepository.findById(memberId)
                .map(member -> riotApiService.getMostChampions(member.getPuuid(), seasonId, limit))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }
}
