package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Comparator;
import jakarta.annotation.PostConstruct;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(name = "riot.api.mode", havingValue = "REAL")
public class RealRiotApiService implements RiotApiService {

        @Value("${riot.api.key}")
        private String apiKey;

        private final WebClient webClient;
        private Map<Long, String> championIdMap = Collections.emptyMap();

        public RealRiotApiService() {
                this.webClient = WebClient.create();
        }

        @PostConstruct
        public void initChampionData() {
                fetchChampionData().subscribe(
                                map -> {
                                        this.championIdMap = map;
                                        log.info("Champion Data Loaded: {} champions mapped.", map.size());
                                },
                                e -> log.error("Failed to load Champion Data from Data Dragon", e));
        }

        @Override
        public Mono<RiotResponseDTO> searchPlayer(String gameName, String tagLine) {
                log.info("RealRiotApiService.searchPlayer called for {} #{}", gameName, tagLine);

                return getAccount(gameName, tagLine)
                                .flatMap(accountMap -> {
                                        String puuid = (String) accountMap.get("puuid");
                                        String name = (String) accountMap.get("gameName");
                                        String tag = (String) accountMap.get("tagLine");

                                        if (puuid == null) {
                                                return Mono.error(
                                                                new RuntimeException("PUUID is null in Account Data"));
                                        }

                                        // Parallel: Get Summoner & Matches & League (by PUUID)
                                        // Added onErrorResume to prevent entire failure if one part fails
                                        Mono<Map<String, Object>> summonerMono = getSummonerWithFallback(puuid)
                                                        .onErrorResume(e -> {
                                                                log.error("Summoner fetch failed", e);
                                                                return Mono.just(Collections.emptyMap());
                                                        });

                                        Mono<List<Map<String, Object>>> masteryMono = getChampionMastery(puuid)
                                                        .onErrorResume(e -> {
                                                                log.error("Mastery fetch failed", e);
                                                                return Mono.just(Collections.emptyList());
                                                        });

                                        Mono<List<Map<String, Object>>> matchesMono = fetchRecentMatches(puuid)
                                                        .onErrorResume(e -> {
                                                                log.error("Match fetch failed", e);
                                                                return Mono.just(Collections.emptyList());
                                                        });

                                        Mono<Map<String, Object>> leagueMono = getLeagueEntry(puuid)
                                                        .onErrorResume(e -> {
                                                                log.error("League fetch failed", e);
                                                                return Mono.just(Collections.emptyMap());
                                                        });

                                        return Mono.zip(summonerMono, masteryMono, matchesMono, leagueMono)
                                                        .flatMap(tuple -> {
                                                                Map<String, Object> summonerData = tuple.getT1();
                                                                List<Map<String, Object>> masteryData = tuple.getT2();
                                                                List<Map<String, Object>> matchData = tuple.getT3();
                                                                Map<String, Object> leagueData = tuple.getT4();

                                                                log.info("DEBUG: Summoner Data: {}", summonerData);
                                                                log.info("DEBUG: League Data: {}", leagueData);
                                                                log.info("DEBUG: Match Data Size: {}",
                                                                                matchData.size());

                                                                return Mono.just(buildResponse(name, tag, puuid,
                                                                                summonerData,
                                                                                leagueData,
                                                                                masteryData,
                                                                                matchData));
                                                        });
                                })
                                .doOnError(e -> {
                                        if (e instanceof WebClientResponseException) {
                                                WebClientResponseException ex = (WebClientResponseException) e;
                                                log.error("Riot API Error: {} - Body: {}", ex.getStatusCode(),
                                                                ex.getResponseBodyAsString());
                                        } else {
                                                log.error("Unknown Error during Riot API call", e);
                                        }
                                });
        }

        // --- Core API Calls ---

        private Mono<Map<String, Object>> getAccount(String gameName, String tagLine) {
                return webClient.get()
                                .uri("https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}",
                                                gameName, tagLine)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(map -> (Map<String, Object>) map);
        }

        private Mono<Map<String, Object>> getSummonerWithFallback(String puuid) {
                return getSummoner(puuid)
                                .onErrorResume(e -> {
                                        log.error("LoL Summoner V4 failed, trying TFT fallback", e);
                                        return getTFTSummoner(puuid);
                                });
        }

        private Mono<Map<String, Object>> getSummoner(String puuid) {
                return webClient.get()
                                .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}", puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(map -> (Map<String, Object>) map);
        }

        private Mono<Map<String, Object>> getTFTSummoner(String puuid) {
                return webClient.get()
                                .uri("https://kr.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/{puuid}", puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(map -> (Map<String, Object>) map);
        }

        private Mono<List<Map<String, Object>>> getChampionMastery(String puuid) {
                return webClient.get()
                                .uri("https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}",
                                                puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToFlux(Map.class)
                                .map(map -> (Map<String, Object>) map)
                                .collectList();
        }

        private Mono<Map<String, Object>> getLeagueEntry(String puuid) {
                return webClient.get()
                                .uri("https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}", puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToFlux(Map.class)
                                .map(map -> (Map<String, Object>) map)
                                .filter(entry -> "RANKED_SOLO_5x5".equals(entry.get("queueType")))
                                .next()
                                .defaultIfEmpty(Collections.emptyMap());
        }

        private Mono<List<Map<String, Object>>> fetchRecentMatches(String puuid) {
                return webClient.get()
                                .uri("https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=20",
                                                puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<List<String>>() {
                                })
                                .flatMapMany(Flux::fromIterable)
                                .delayElements(java.time.Duration.ofMillis(100))
                                .flatMap(matchId -> webClient.get()
                                                .uri("https://asia.api.riotgames.com/lol/match/v5/matches/{matchId}",
                                                                matchId)
                                                .header("X-Riot-Token", apiKey)
                                                .retrieve()
                                                .bodyToMono(Map.class)
                                                .map(map -> (Map<String, Object>) map)
                                                .onErrorResume(e -> {
                                                        log.warn("Failed to fetch match {}: {}", matchId,
                                                                        e.getMessage());
                                                        return Mono.empty();
                                                }))
                                .collectList();
        }

        // --- Data Dragon Integration ---
        private Mono<Map<Long, String>> fetchChampionData() {
                return webClient.get()
                                .uri("https://ddragon.leagueoflegends.com/cdn/14.2.1/data/en_US/champion.json")
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(response -> {
                                        Map<String, Object> data = (Map<String, Object>) response.get("data");
                                        return data.values().stream()
                                                        .map(obj -> (Map<String, Object>) obj)
                                                        .collect(Collectors.toMap(
                                                                        c -> Long.parseLong((String) c.get("key")),
                                                                        c -> (String) c.get("name")));
                                });
        }

        // --- DTO Builder ---
        private RiotResponseDTO buildResponse(String gameName, String tagLine, String puuid,
                        Map<String, Object> summoner, Map<String, Object> league, List<Map<String, Object>> masteries,
                        List<Map<String, Object>> matches) {

                long level = 0;
                int iconId = 0;
                if (summoner.containsKey("summonerLevel"))
                        level = ((Number) summoner.get("summonerLevel")).longValue();
                if (summoner.containsKey("profileIconId"))
                        iconId = ((Number) summoner.get("profileIconId")).intValue();

                RiotResponseDTO.Account account = RiotResponseDTO.Account.builder()
                                .gameName(gameName)
                                .tagLine(tagLine)
                                .puuid(puuid)
                                .summonerLevel(level)
                                .profileIconId(iconId)
                                .build();

                RiotResponseDTO.SoloRank soloRank;
                if (league.isEmpty()) {
                        soloRank = RiotResponseDTO.SoloRank.builder().hasRank(false).build();
                } else {
                        int wins = ((Number) league.get("wins")).intValue();
                        int losses = ((Number) league.get("losses")).intValue();
                        double winRate = (double) wins / (wins + losses) * 100;

                        soloRank = RiotResponseDTO.SoloRank.builder()
                                        .hasRank(true)
                                        .tier((String) league.get("tier"))
                                        .division((String) league.get("rank"))
                                        .lp(((Number) league.get("leaguePoints")).intValue())
                                        .wins(wins)
                                        .losses(losses)
                                        .winRate(Math.round(winRate * 10.0) / 10.0)
                                        .build();
                }

                List<RiotResponseDTO.MostChampion> top3 = masteries.stream()
                                .limit(3)
                                .map(m -> {
                                        long champId = ((Number) m.get("championId")).longValue();
                                        String champName = championIdMap.getOrDefault(champId, "ID-" + champId);
                                        return new RiotResponseDTO.MostChampion(
                                                        champId,
                                                        champName,
                                                        ((Number) m.get("championPoints")).longValue());
                                })
                                .collect(Collectors.toList());

                RiotResponseDTO.MatchAnalysis analysis = calculateMatchAnalysis(matches, puuid);
                List<RiotResponseDTO.MatchSummary> history = createMatchHistory(matches, puuid);

                return RiotResponseDTO.builder()
                                .account(account)
                                .soloRank(soloRank)
                                .mostChampions(top3)
                                .matchAnalysis(analysis)
                                .matchHistory(history)
                                .build();
        }

        private RiotResponseDTO.MatchAnalysis calculateMatchAnalysis(List<Map<String, Object>> matches,
                        String myPuuid) {
                int wins = 0;
                int losses = 0;
                java.util.Map<String, Integer> positionCounts = new java.util.HashMap<>();

                for (Map<String, Object> match : matches) {
                        Map<String, Object> info = (Map<String, Object>) match.get("info");
                        List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");

                        for (Map<String, Object> p : participants) {
                                if (myPuuid.equals(p.get("puuid"))) {
                                        boolean win = (boolean) p.get("win");
                                        if (win)
                                                wins++;
                                        else
                                                losses++;

                                        String position = (String) p.get("teamPosition");
                                        if (position == null || position.isEmpty())
                                                position = "UNKNOWN";
                                        positionCounts.put(position, positionCounts.getOrDefault(position, 0) + 1);
                                        break;
                                }
                        }
                }

                // Find Main and Sub Positions
                List<Map.Entry<String, Integer>> sortedPositions = new ArrayList<>(positionCounts.entrySet());
                sortedPositions.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));

                String mainPos = "FILL";
                double mainRate = 0;
                String subPos = "None";
                double subRate = 0;
                int total = wins + losses;

                if (!sortedPositions.isEmpty()) {
                        mainPos = sortedPositions.get(0).getKey();
                        mainRate = total == 0 ? 0 : (double) sortedPositions.get(0).getValue() / total * 100;
                }
                if (sortedPositions.size() > 1) {
                        subPos = sortedPositions.get(1).getKey();
                        subRate = total == 0 ? 0 : (double) sortedPositions.get(1).getValue() / total * 100;
                }

                double winRate = total == 0 ? 0 : (double) wins / total * 100;

                return RiotResponseDTO.MatchAnalysis.builder()
                                .totalGames(total)
                                .wins(wins)
                                .losses(losses)
                                .winRate(Math.round(winRate * 10.0) / 10.0)
                                .mainPosition(mainPos)
                                .mainPositionRate(Math.round(mainRate * 10.0) / 10.0)
                                .subPosition(subPos)
                                .subPositionRate(Math.round(subRate * 10.0) / 10.0)
                                .build();
        }

        private List<RiotResponseDTO.MatchSummary> createMatchHistory(List<Map<String, Object>> matches,
                        String myPuuid) {
                List<RiotResponseDTO.MatchSummary> history = new ArrayList<>();

                for (Map<String, Object> match : matches) {
                        Map<String, Object> info = (Map<String, Object>) match.get("info");
                        Map<String, Object> metadata = (Map<String, Object>) match.get("metadata");
                        List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");

                        for (Map<String, Object> p : participants) {
                                if (myPuuid.equals(p.get("puuid"))) {
                                        history.add(RiotResponseDTO.MatchSummary.builder()
                                                        .matchId((String) metadata.get("matchId"))
                                                        .championName((String) p.get("championName"))
                                                        .kills(((Number) p.get("kills")).intValue())
                                                        .deaths(((Number) p.get("deaths")).intValue())
                                                        .assists(((Number) p.get("assists")).intValue())
                                                        .win((boolean) p.get("win"))
                                                        .gameMode((String) info.get("gameMode"))
                                                        .gameEndTimestamp(((Number) info.get("gameEndTimestamp"))
                                                                        .longValue())
                                                        .build());
                                        break;
                                }
                        }
                }
                return history;
        }
}
