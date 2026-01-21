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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
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
    private final StringRedisTemplate redisTemplate;

    public RealRiotApiService(@Value("${riot.api.key}") String apiKey, MatchRepository matchRepository,
            SeasonRepository seasonRepository, StringRedisTemplate redisTemplate) {
        this.apiKey = apiKey;
        this.matchRepository = matchRepository;
        this.seasonRepository = seasonRepository;
        this.redisTemplate = redisTemplate;
        this.webClient = WebClient.create();
    }

    // --- Caching Logic ---

    @Override
    public String getPuuid(String gameName, String tagLine) {
        return getAccount(gameName, tagLine)
                .map(account -> (String) account.get("puuid"))
                .block(); // Block to return String
    }

    public String seedMatches(String gameName, String tagLine) {
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
                })
                .block(); // Block here too if needed, or leave as Mono if not in interface (but converting for consistency)
    }

    @Override
    public List<MostChampionDTO> getMostChampions(String puuid, String seasonId, int limit) {
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

            long startMillis = startEpoch * 1000L;

            return matchRepository.findMostChampions(puuid, startMillis, endTime,
                    limit);
        })
        .collectList()
        .block(); // Block to return List
    }

    private Mono<List<String>> fetchAllMatchIds(String puuid, long startTime, int start, List<String> accumulator) {
        int count = 100; // Increased to 100 (Max)
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("asia.api.riotgames.com")
                        .path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                        .queryParam("startTime", startTime)
                        .queryParam("type", "ranked") // Added type=ranked
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
                        .switchIfEmpty(fetchAndSaveMatch(matchId).map(MatchDocument::getData)) // Fetch/Save
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

    @Override
    public String refreshMatches(kr.draftgo.Draft_Go_BE.member.domain.Member member) {
        // 0. Cooldown Check (2 minutes)
        if (member.getUpdatedAt() != null) {
            long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toMinutes();
            if (diff < 2) {
                return "Matches are already up to date. (Try again later)";
            }
        }

        // 1. Resolve PUUID if missing
        Mono<String> puuidMono;
        if (member.getPuuid() != null && !member.getPuuid().isEmpty()) {
            puuidMono = Mono.just(member.getPuuid());
        } else {
            puuidMono = getAccount(member.getGameName(), member.getTagLine())
                    .map(account -> (String) account.get("puuid"));
        }

        return puuidMono.flatMap(puuid -> {
            String lockKey = "LOCK:MATCH:" + puuid;

            // 2. Redis Lock
            return Mono.justOrEmpty(redisTemplate.hasKey(lockKey))
                    .flatMap(hasKey -> {
                        if (Boolean.TRUE.equals(hasKey)) {
                            return Mono.just("Update already in progress.");
                        }
                        return Mono.empty();
                    })
                    .switchIfEmpty(Mono.defer(() -> {
                        redisTemplate.opsForValue().set(lockKey, "LOCKED",
                                Duration.ofSeconds(30));

                        return seasonRepository.findByIsActiveTrue()
                                .map(season -> season.getStartTime())
                                .defaultIfEmpty(1767807600L) // Default Jan 8 2026
                                .flatMap(seasonStart -> {
                                    long startTime = seasonStart;

                                    log.info("Refreshing matches for {} since epoch {}",
                                            member.getGameName(),
                                            startTime);

                                    return fetchAllMatchIds(puuid, startTime, 0,
                                            new ArrayList<>())
                                            .flatMap(ids -> {
                                                if (ids.isEmpty()) {
                                                    return Mono.just(
                                                            "No new matches found.");
                                                }
                                                // Deduplicate: Filter out matches we already have
                                                return Flux.fromIterable(ids)
                                                        .flatMap(id -> matchRepository
                                                                        .existsById(id)
                                                                        .map(exists -> reactor.util.function.Tuples
                                                                                        .of(id, exists)))
                                                        .filter(tuple -> !tuple.getT2()) // Keep only if NOT exists
                                                        .map(reactor.util.function.Tuple2::getT1)
                                                        .collectList()
                                                        .flatMap(newIds -> {
                                                                if (newIds.isEmpty()) {
                                                                        return Mono.just(
                                                                                        "Matches are already up to date.");
                                                                }
                                                                return Flux.fromIterable(newIds)
                                                                                .delayElements(Duration.ofMillis(200))
                                                                                .flatMap(this::fetchAndSaveMatch)
                                                                                .count()
                                                                                .map(count -> "Updated "
                                                                                                + count
                                                                                                + " new matches.");
                                                        });
                                            });
                                })
                                .doFinally(signal -> redisTemplate.delete(lockKey));
                    }))
                    .cast(String.class);
        })
        .block(); // Block here
    }
}
