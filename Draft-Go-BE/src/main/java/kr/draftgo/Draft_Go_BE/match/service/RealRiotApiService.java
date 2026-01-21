package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.match.repository.SeasonRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
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

                        return matchRepository.save(doc);
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
        public String refreshMatches(Member member) {
                // 0. Cooldown Check
                if (member.getUpdatedAt() != null) {
                        long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toMinutes();
                        if (diff < 2) {
                                return "Matches are already up to date. (Try again later)";
                        }
                }

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

                        log.info("Refreshing matches for {} since epoch {}", member.getGameName(), seasonStart);

                        List<String> matchIds = fetchAllMatchIds(puuid, seasonStart);

                        if (matchIds.isEmpty()) {
                                return "No new matches found.";
                        }

                        int count = 0;
                        for (String matchId : matchIds) {
                                if (!matchRepository.existsById(matchId)) {
                                        fetchAndSaveMatch(matchId);
                                        count++;
                                        try {
                                                Thread.sleep(200); // Rate limiting
                                        } catch (InterruptedException e) {
                                                Thread.currentThread().interrupt();
                                        }
                                }
                        }

                        if (count == 0) {
                                return "Matches are already up to date.";
                        }
                        return "Updated " + count + " new matches.";

                } finally {
                        redisTemplate.delete(lockKey);
                }
        }

    @Override
    public java.util.Map<String, Object> getLeagueInfoByPuuid(String puuid) {
        try {
            String summonerId = getEncryptedSummonerId(puuid);
            List<Map<String, Object>> leagueEntries = getLeagueEntries(summonerId);
            
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

    private String getEncryptedSummonerId(String puuid) {
        Map<String, Object> summoner = restClient.get()
                .uri("https://asia.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}", puuid)
                .header("X-Riot-Token", apiKey)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });
        return (String) summoner.get("id");
    }

    private List<Map<String, Object>> getLeagueEntries(String summonerId) {
        return restClient.get()
                .uri("https://asia.api.riotgames.com/lol/league/v4/entries/by-summoner/{summonerId}", summonerId)
                .header("X-Riot-Token", apiKey)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                });
    }
}
