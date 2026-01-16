package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.match.repository.SeasonRepository;
import kr.draftgo.Draft_Go_BE.match.service.RealRiotApiService;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RiotApiService riotApiService;
    private final SeasonRepository seasonRepository;
    private final ApplicationContext context;

    @PostMapping("/season")
    public Mono<SeasonDocument> createSeason(@RequestBody SeasonDocument season) {
        // If marking as active, safely could set others to inactive if needed (manual logic for now)
        return seasonRepository.save(season);
    }

    @GetMapping("/seed")
    public Mono<String> seedMatches(@RequestParam String gameName, @RequestParam String tagLine) {
        log.info("Admin seeding request for {} #{}", gameName, tagLine);

        // Check if the actual implementation is RealRiotApiService, as the interface
        // doesn't have seedMatches
        if (riotApiService instanceof RealRiotApiService) {
            return ((RealRiotApiService) riotApiService).seedMatches(gameName, tagLine);
        } else {
            return Mono.just("Current mode is not REAL. Seeding skipped.");
        }
    }

    @GetMapping("/count")
    public Mono<Long> countMatches() {
        if (riotApiService instanceof RealRiotApiService) {
            return ((RealRiotApiService) riotApiService).countMatches();
        }
        return Mono.just(0L);
    }
}
