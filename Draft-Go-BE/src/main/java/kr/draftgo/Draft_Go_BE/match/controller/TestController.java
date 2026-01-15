package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.TournamentApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class TestController {

    private final TournamentApiService tournamentApiService;

    public TestController(TournamentApiService tournamentApiService) {
        this.tournamentApiService = tournamentApiService;
    }

    @GetMapping("/test/tournament/code")
    public Mono<String> generateCode() {
        return tournamentApiService.generateOneTimeCode();
    }
}
