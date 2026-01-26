package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@ConditionalOnProperty(name = "riot.api.mode", havingValue = "REAL")
public class RealRiotApiService implements RiotApiService {

        private final String apiKey;
        private final RestClient restClient;
        private final MatchRepository matchRepository;
        private final SeasonRepository seasonRepository;
        private final StringRedisTemplate redisTemplate;

        public RealRiotApiService(@Value("${riot.api.key}") String apiKey, MatchRepository matchRepository,
                        SeasonRepository seasonRepository, StringRedisTemplate redisTemplate) {
                this.apiKey = apiKey;
                this.matchRepository = matchRepository;
                this.seasonRepository = seasonRepository;
                this.redisTemplate = redisTemplate;
                this.restClient = RestClient.create();
        }
        // --- Core API Calls ---

        private Map<String, Object> getAccount(String gameName, String tagLine) {
                return restClient.get()
                                .uri("https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}",
                                                gameName, tagLine)
                                .header("X-Riot-Token", apiKey)
                                .retrieve()
                                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                });
        }

        private List<String> fetchAllMatchIds(String puuid, long startTime) {
                List<String> allIds = new ArrayList<>();
                int count = 100;
                int currentStart = 0;

                while (true) {
                        final int finalStart = currentStart;
                        List<String> ids = restClient.get()
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
                                        });

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
                        Map<String, Object> data = restClient.get()
                                        .uri("https://asia.api.riotgames.com/lol/match/v5/matches/{matchId}", matchId)
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

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
                } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                        throw e;
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
                        startTime = seasonRepository.findByIsActiveTrue()
                                        .map(season -> season.getStartTime())
                                        .orElse(1767807600L); // Default: Jan 8 2026
                } else {
                        startTime = seasonRepository.findById(seasonId)
                                        .map(season -> season.getStartTime())
                                        .orElse(1767807600L);
                }

                long endTime = Instant.now().toEpochMilli() + 100000000L;
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
                        Long seasonStart = seasonRepository.findByIsActiveTrue()
                                        .map(season -> season.getStartTime())
                                        .orElse(1767807600L);

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
                                        try {
                                                Thread.sleep(1250); // Rate limiting (1250ms for 100 req/2min of App
                                                                    // Limit)
                                        } catch (InterruptedException e) {
                                                Thread.currentThread().interrupt();
                                        }
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
                        List<Map<String, Object>> leagueEntries = fetchLeagueEntriesByPuuid(puuid);

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
                        return restClient.get()
                                        .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}",
                                                        puuid)
                                        .header("X-Riot-Token", apiKey)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        });
                } catch (Exception e) {
                        log.error("Failed to get summoner info for puuid: {}", puuid, e);
                        return Collections.emptyMap();
                }
        }
}
