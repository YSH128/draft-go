package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.match.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final SeasonRepository seasonRepository;

    @PostMapping("/season")
    public Mono<SeasonDocument> createSeason(@RequestBody SeasonDocument season) {
        // If marking as active, safely could set others to inactive if needed (manual
        // logic for now)
        return seasonRepository.save(season);
    }
}
