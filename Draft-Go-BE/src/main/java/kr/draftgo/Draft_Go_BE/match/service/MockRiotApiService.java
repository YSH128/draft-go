package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.List;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO; // Added import for MostChampionDTO

@Service
@ConditionalOnProperty(name = "riot.api.mode", havingValue = "MOCK", matchIfMissing = true)
public class MockRiotApiService implements RiotApiService {

        @Override
        public Mono<String> getPuuid(String gameName, String tagLine) {
                return Mono.just("mock-puuid-" + Math.abs((gameName + tagLine).hashCode()));
        }

        @Override
        public Flux<MostChampionDTO> getMostChampions(String puuid, String seasonId, int limit) {
                return Flux.empty();
        }

        @Override
        public Mono<String> refreshMatches(kr.draftgo.Draft_Go_BE.member.domain.Member member) {
                return Mono.just("Mock: Refreshed matches for " + member.getGameName());
        }
}
