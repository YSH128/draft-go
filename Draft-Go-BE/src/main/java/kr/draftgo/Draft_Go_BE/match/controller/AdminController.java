package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.RealRiotApiService;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RiotApiService riotApiService;
    private final ApplicationContext context;

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
