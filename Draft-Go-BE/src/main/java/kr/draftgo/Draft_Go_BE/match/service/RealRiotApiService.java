package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.match.repository.SeasonRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@ConditionalOnProperty(name = "riot.api.mode", havingValue = "REAL")
public class RealRiotApiService implements RiotApiService {

        private final String apiKey;
        private final WebClient webClient;
        private final MatchRepository matchRepository;
        private final SeasonRepository seasonRepository;
        private Map<Long, String> championIdMap = Collections.emptyMap();

        public RealRiotApiService(@Value("${riot.api.key}") String apiKey, MatchRepository matchRepository,
                        SeasonRepository seasonRepository) {
                this.apiKey = apiKey;
                this.matchRepository = matchRepository;
                this.seasonRepository = seasonRepository;
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

                                        // Parallel execution
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

                                        // Match Cache Logic
                                        Mono<List<Map<String, Object>>> matchesMono = fetchMatchesWithCache(puuid)
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

                                                                return Mono.just(buildResponse(name, tag, puuid,
                                                                                summonerData, leagueData, masteryData,
                                                                                matchData));
                                                        });
                                });
        }

        // --- Caching Logic ---

        public Mono<String> seedMatches(String gameName, String tagLine) {
                return getAccount(gameName, tagLine)
                                .flatMap(account -> {
                                        String puuid = (String) account.get("puuid");

                                        // 1. Find active season first
                                        return seasonRepository.findByIsActiveTrue()
                                                        .map(season -> season.getStartTime())
                                                        .defaultIfEmpty(1767807600L) // Fallback: Jan 8 2026
                                                        .flatMap(startEpoch -> {
                                                                return fetchAllMatchIds(puuid, startEpoch, 0,
                                                                                new ArrayList<>())
                                                                                .flatMap(ids -> {
                                                                                        log.info("Seeding matches for {} since epoch {}. Found: {}",
                                                                                                        gameName,
                                                                                                        startEpoch,
                                                                                                        ids.size());
                                                                                        return Flux.fromIterable(ids)
                                                                                                        .delayElements(Duration
                                                                                                                        .ofMillis(200))
                                                                                                        .flatMap(this::fetchAndSaveMatch)
                                                                                                        .then(Mono.just("Seeded "
                                                                                                                        + ids.size()
                                                                                                                        + " matches."));
                                                                                });
                                                        });
                                });
        }

        public Mono<Long> countMatches() {
                return matchRepository.count();
        }

        public Flux<MostChampionDTO> getMostChampions(String gameName, String tagLine, String seasonId, int limit) {
                return getAccount(gameName, tagLine)
                                .flatMapMany(account -> {
                                        String puuid = (String) account.get("puuid");

                                        Mono<Long> startTimeMono;
                                        if (seasonId == null || seasonId.isEmpty()) {
                                                // Default to Active Season
                                                startTimeMono = seasonRepository.findByIsActiveTrue()
                                                                .map(season -> season.getStartTime())
                                                                .defaultIfEmpty(1767807600L);
                                        } else {
                                                startTimeMono = seasonRepository.findById(seasonId)
                                                                .map(season -> season.getStartTime())
                                                                .defaultIfEmpty(1767807600L);
                                        }

                                        return startTimeMono.flatMapMany(startEpoch -> {
                                                // End time is "now" for active season + buffer
                                                long endTime = Instant.now().toEpochMilli() + 100000000L;

                                                // Note: season.getStartTime() is in Seconds (Epoch), Match.gameCreation
                                                // is Millis
                                                long startMillis = startEpoch * 1000L;

                                                return matchRepository.findMostChampions(puuid, startMillis, endTime,
                                                                limit);
                                        });
                                });
        }

        private Mono<List<String>> fetchAllMatchIds(String puuid, long startTime, int start, List<String> accumulator) {
                int count = 40; // Max batch size
                return webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .scheme("https")
                                .host("asia.api.riotgames.com")
                                .path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                                .queryParam("startTime", startTime)
                                .queryParam("start", start)
                                .queryParam("count", count)
                                .build(puuid))
                        .header("X-Riot-Token", apiKey)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<String>>() {
                        })
                        .flatMap(ids -> {
                                accumulator.addAll(ids);
                                if (ids.size() < count) {
                                        // End of list
                                        return Mono.just(accumulator);
                                } else {
                                        // Fetch next page
                                        return fetchAllMatchIds(puuid, startTime, start + count, accumulator);
                                }
                        });
        }

        private Mono<List<Map<String, Object>>> fetchMatchesWithCache(String puuid) {
                return webClient.get()
                                .uri("https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=20",
                                                puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<List<String>>() {
                                })
                                .flatMapMany(Flux::fromIterable)
                                .flatMap(matchId -> matchRepository.findById(matchId)
                                                .map(MatchDocument::getData) // Found in DB
                                                .switchIfEmpty(fetchAndSaveMatch(matchId).map(MatchDocument::getData)) // Fetch
                                                                                                                       // &
                                                                                                                       // Save
                                )
                                .collectList();
        }

        private Mono<MatchDocument> fetchAndSaveMatch(String matchId) {
                return webClient.get()
                                .uri("https://asia.api.riotgames.com/lol/match/v5/matches/{matchId}", matchId)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .flatMap(data -> {
                                        Map<String, Object> info = (Map<String, Object>) data.get("info");
                                        long creation = ((Number) info.get("gameCreation")).longValue();
                                        String mode = (String) info.get("gameMode");

                                        MatchDocument doc = MatchDocument.builder()
                                                        .matchId(matchId)
                                                        .data((Map<String, Object>) data)
                                                        .gameCreation(creation)
                                                        .gameMode(mode)
                                                        .build();

                                        return matchRepository.save(doc);
                                })
                                .onErrorResume(e -> {
                                        log.warn("Failed to fetch/save match {}", matchId);
                                        return Mono.empty();
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
                        Map<String, Object> summoner, Map<String, Object> league,
                        List<Map<String, Object>> masteries, List<Map<String, Object>> matches) {

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
                Map<String, Integer> positionCounts = new HashMap<>();

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
