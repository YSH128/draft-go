package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

@Slf4j
@RestController
@RequiredArgsConstructor
public class RiotController {

    private final RiotApiService riotApiService;

    @PostConstruct
    public void init() {
        log.info("RiotController initialized with service: {}", riotApiService.getClass().getName());
    }

    // API: JSON Response (As per API Spec)
    @GetMapping("/api/v1/search/player")
    public Mono<RiotResponseDTO> searchPlayerApi(@RequestParam String gameName,
            @RequestParam String tagLine) {
        return riotApiService.searchPlayer(gameName, tagLine);
    }
}
