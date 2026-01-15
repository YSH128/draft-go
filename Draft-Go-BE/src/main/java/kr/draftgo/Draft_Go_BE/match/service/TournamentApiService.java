package kr.draftgo.Draft_Go_BE.match.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class TournamentApiService {

        private static final Logger log = LoggerFactory.getLogger(TournamentApiService.class);
        private final WebClient webClient;

        @Value("${riot.api.key}")
        private String apiKey;

        public TournamentApiService() {
                this.webClient = WebClient.create();
        }

        // 1. Create Provider
        public Mono<Integer> createProvider() {
                // Stub API uses 'americas' usually, or specific regions. Let's use 'americas'
                // as a hub.
                // For 'Stub', the URL is .../lol/tournament-stub/v5/providers
                String url = "https://americas.api.riotgames.com/lol/tournament-stub/v5/providers";

                Map<String, Object> body = Map.of(
                                "region", "KR", // The region where games are played
                                "url", "http://localhost:8080/tournament/callback" // Dummy callback
                );

                return webClient.post()
                                .uri(url)
                                .header("X-Riot-Token", apiKey)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(Integer.class)
                                .doOnError(e -> log.error("Failed to create provider", e));
        }

        // 2. Create Tournament
        public Mono<Integer> createTournament(int providerId) {
                String url = "https://americas.api.riotgames.com/lol/tournament-stub/v5/tournaments";

                Map<String, Object> body = Map.of(
                                "name", "Auction Tournament",
                                "providerId", providerId);

                return webClient.post()
                                .uri(url)
                                .header("X-Riot-Token", apiKey)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(Integer.class)
                                .doOnError(e -> log.error("Failed to create tournament", e));
        }

        // 3. Create Code
        public Mono<String> createTournamentCode(int tournamentId) {
                // Query param: count=1, tournamentId=...
                String url = "https://americas.api.riotgames.com/lol/tournament-stub/v5/codes?count=1&tournamentId="
                                + tournamentId;

                // Body: details about the game
                Map<String, Object> body = Map.of(
                                "mapType", "SUMMONERS_RIFT",
                                "pickType", "TOURNAMENT_DRAFT",
                                "spectatorType", "ALL",
                                "teamSize", 5,
                                "metadata", "AuctionMatch_Test");

                return webClient.post()
                                .uri(url)
                                .header("X-Riot-Token", apiKey)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(List.class) // Returns List<String>
                                .map(list -> (String) list.get(0))
                                .doOnError(e -> log.error("Failed to create code", e));
        }

        // Facade to do all 3 steps
        public Mono<String> generateOneTimeCode() {
                return createProvider()
                                .flatMap(this::createTournament)
                                .flatMap(this::createTournamentCode);
        }
}
