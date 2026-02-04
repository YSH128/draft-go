package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.service.SeasonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Callable;

@Slf4j
@Service
public class RealRiotApiService implements RiotApiService {

        private final String apiKey;
        private final RestClient restClient;
        private final MatchRepository matchRepository;
        private final SeasonService seasonService;
        private final StringRedisTemplate redisTemplate;
        private final io.github.bucket4j.Bucket bucket;

        public RealRiotApiService(@Value("${riot.api.key}") String apiKey, MatchRepository matchRepository,
                        SeasonService seasonService,
                        StringRedisTemplate redisTemplate) {
                this.apiKey = apiKey;
                this.matchRepository = matchRepository;
                this.seasonService = seasonService;
                this.redisTemplate = redisTemplate;
                this.restClient = RestClient.create();

                // Rate Limit 1: 100 requests per 2 minutes (App Rate Limit)
                io.github.bucket4j.Bandwidth limit1 = io.github.bucket4j.Bandwidth.classic(100,
                                io.github.bucket4j.Refill.intervally(100, Duration.ofMinutes(2)));

                // Rate Limit 2: 5 requests per 1 second (Method Rate Limit - Super
                // Conservative)
                io.github.bucket4j.Bandwidth limit2 = io.github.bucket4j.Bandwidth.classic(5,
                                io.github.bucket4j.Refill.intervally(5, Duration.ofSeconds(1)));

                this.bucket = io.github.bucket4j.Bucket.builder()
                                .addLimit(limit1)
                                .addLimit(limit2)
                                .build();
        }

        // --- Core API Calls ---

        private <T> T executeWithRetry(Callable<T> task) {
                int maxRetries = 3;
                int retryCount = 0;

                while (true) {
                        try {
                                bucket.asBlocking().consume(1); // Rate Limit Check
                                return task.call();
                        } catch (HttpClientErrorException.TooManyRequests e) {
                                retryCount++;
                                if (retryCount > maxRetries) {
                                        log.error("Exceeded max retries for rate limit. Throwing exception.");
                                        throw e;
                                }

                                long sleepSeconds = 1; // Default
                                if (e.getResponseHeaders() != null) {
                                        try {
                                                String retryAfter = e.getResponseHeaders().getFirst("Retry-After");
                                                if (retryAfter != null) {
                                                        sleepSeconds = Long.parseLong(retryAfter);
                                                }
                                        } catch (NumberFormatException ex) {
                                                log.warn("Failed to parse Retry-After header: {}", ex.getMessage());
                                        }
                                }

                                log.warn("429 Too Many Requests blocked by Riot. Sleeping for {} seconds before retry {}/{}",
                                                sleepSeconds, retryCount, maxRetries);

                                try {
                                        Thread.sleep(sleepSeconds * 1000 + 100); // Sleep + buffer
                                } catch (InterruptedException ie) {
                                        Thread.currentThread().interrupt();
                                        throw new RuntimeException("Thread interrupted while waiting for retry", ie);
                                }

                        } catch (Exception e) {
                                if (e instanceof InterruptedException) {
                                        Thread.currentThread().interrupt();
                                        throw new RuntimeException("Interrupted", e);
                                }
                                if (e instanceof RuntimeException) {
                                        throw (RuntimeException) e;
                                }
                                throw new RuntimeException("Unexpected error during API call", e);
                        }
                }
        }

        private Map<String, Object> getAccount(String gameName, String tagLine) {
                return executeWithRetry(() -> restClient.get()
                                .uri("https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}",
                                                gameName, tagLine)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                }));
        }

        private List<String> fetchAllMatchIds(String puuid, long startTime) {
                List<String> allIds = new ArrayList<>();
                int count = 100;
                int currentStart = 0;

                while (true) {
                        final int finalStart = currentStart;
                        List<String> ids = executeWithRetry(() -> restClient.get()
                                        .uri(uriBuilder -> uriBuilder
                                                        .scheme("https")
                                                        .host("asia.api.riotgames.com")
                                                        .path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                                                        .queryParam("startTime", startTime)
                                                        .queryParam("type", "ranked")
                                                        .queryParam("start", finalStart)
                                                        .queryParam("count", count)
                                                        .build(puuid))
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<List<String>>() {
                                        }));

                        if (ids == null || ids.isEmpty()) {
                                break;
                        }

                        allIds.addAll(ids);

                        if (ids.size() < count) {
                                break;
                        }
                        currentStart += count;
                }
                return allIds;
        }

        private MatchDocument fetchAndSaveMatch(String matchId) {
                try {
                        Map<String, Object> data = executeWithRetry(() -> restClient.get()
                                        .uri("https://asia.api.riotgames.com/lol/match/v5/matches/{matchId}", matchId)
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        }));

                        if (data == null)
                                return null;

                        Map<String, Object> info = (Map<String, Object>) data.get("info");
                        long creation = ((Number) info.get("gameCreation")).longValue();
                        String mode = (String) info.get("gameMode");

                        MatchDocument doc = MatchDocument.builder()
                                        .matchId(matchId)
                                        .data(data)
                                        .gameCreation(creation)
                                        .gameMode(mode)
                                        .build();

                        if (doc == null) {
                                log.error("MatchDocument is null before save for ID: {}", matchId);
                                return null;
                        }
                        log.info("Attempting to save MatchDocument to MongoDB. ID: {}", matchId);
                        MatchDocument savedDoc = matchRepository.save(doc);
                        if (savedDoc != null) {
                                log.info("Successfully saved match to MongoDB. ID: {}", savedDoc.getMatchId());
                        } else {
                                log.error("MongoDB save returned null for match ID: {}", matchId);
                        }
                        return savedDoc;

                } catch (Exception e) {
                        log.warn("Failed to fetch/save match {}", matchId, e);
                        return null;
                }
        }

        @Override
        public String getPuuid(String gameName, String tagLine) {
                Map<String, Object> account = getAccount(gameName, tagLine);
                return (String) account.get("puuid");
        }

        @Override
        public List<MostChampionDTO> getMostChampions(String puuid, String seasonId, int limit) {
                long startTime;
                if (seasonId == null || seasonId.isEmpty()) {
                        SeasonDocument activeSeason = seasonService
                                        .getActiveSeason();
                        if (activeSeason != null && activeSeason.getStartTime() != null) {
                                startTime = activeSeason.getStartTime().atZone(java.time.ZoneId.systemDefault())
                                                .toEpochSecond();
                        } else {
                                startTime = 1767807600L; // Default fallback
                        }
                } else {
                        startTime = seasonService.getSeasonById(seasonId)
                                        .map(season -> season.getStartTime().atZone(java.time.ZoneId.systemDefault())
                                                        .toEpochSecond())
                                        .orElse(1767807600L);
                }

                long endTime = Instant.now().toEpochMilli();
                long startMillis = startTime * 1000L;

                return matchRepository.findMostChampions(puuid, startMillis, endTime, limit);
        }

        @Override
        @Transactional(propagation = Propagation.NOT_SUPPORTED)
        public String refreshMatches(Member member) {
                // 1. Resolve PUUID
                String puuid = member.getPuuid();
                if (puuid == null || puuid.isEmpty()) {
                        puuid = getPuuid(member.getGameName(), member.getTagLine());
                }

                String lockKey = "LOCK:MATCH:" + puuid;

                // 2. Redis Lock
                if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
                        return "Update already in progress.";
                }
                redisTemplate.opsForValue().set(lockKey, "LOCKED", Duration.ofSeconds(30));

                try {
                        Long seasonStart = 1767807600L; // Default
                        SeasonDocument activeSeason = seasonService
                                        .getActiveSeason();
                        if (activeSeason != null && activeSeason.getStartTime() != null) {
                                seasonStart = activeSeason.getStartTime().atZone(java.time.ZoneId.systemDefault())
                                                .toEpochSecond();
                        }

                        log.info("Refreshing matches for {} since epoch {}. apiKey={}", member.getGameName(),
                                        seasonStart, apiKey != null ? "Present" : "Missing");

                        List<String> matchIds = fetchAllMatchIds(puuid, seasonStart);
                        log.info("Fetched {} match IDs from Riot API.", matchIds.size());

                        if (matchIds.isEmpty()) {
                                return "최신 상태입니다.";
                        }

                        int count = 0;
                        for (String matchId : matchIds) {
                                if (!matchRepository.existsById(matchId)) {
                                        log.info("Match {} not found in DB. Fetching...", matchId);
                                        MatchDocument saved = fetchAndSaveMatch(matchId);
                                        if (saved != null)
                                                count++;
                                } else {
                                        log.debug("Match {} already exists in DB. Skipping.", matchId);
                                }
                        }

                        if (count == 0) {
                                return "최신 상태입니다.";
                        }
                        return count + "개의 전적이 갱신되었습니다.";

                } finally {
                        redisTemplate.delete(lockKey);
                }
        }

        @Override
        public java.util.Map<String, Object> getLeagueInfoByPuuid(String puuid) {
                try {
                        List<Map<String, Object>> leagueEntries = executeWithRetry(
                                        () -> fetchLeagueEntriesByPuuid(puuid));

                        // Find RANKED_SOLO_5x5
                        for (Map<String, Object> entry : leagueEntries) {
                                if ("RANKED_SOLO_5x5".equals(entry.get("queueType"))) {
                                        return entry;
                                }
                        }
                        return Collections.emptyMap();
                } catch (Exception e) {
                        log.error("Failed to get league info for puuid: {}", puuid, e);
                        return Collections.emptyMap();
                }
        }

        private List<Map<String, Object>> fetchLeagueEntriesByPuuid(String puuid) {
                return restClient.get()
                                .uri("https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}", puuid)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                                });
        }

        @Override
        public Map<String, Object> getSummonerInfo(String puuid) {
                try {
                        return executeWithRetry(() -> restClient.get()
                                        .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}",
                                                        puuid)
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        }));
                } catch (Exception e) {
                        log.error("Failed to get summoner info for puuid: {}", puuid, e);
                        return Collections.emptyMap();
                }
        }

        @Override
        public Map<String, Object> getChallengerLeague(String queue) {
                try {
                        return executeWithRetry(() -> restClient.get()
                                        .uri("https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/{queue}",
                                                        queue)
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        }));
                } catch (Exception e) {
                        log.error("Failed to get Challenger league for queue: {}", queue, e);
                        return Collections.emptyMap();
                }
        }
}
