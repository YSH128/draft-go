package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.domain.MostChampionStat;
import kr.draftgo.Draft_Go_BE.match.domain.MostChampionStat.MostChampion;
import kr.draftgo.Draft_Go_BE.match.dto.MatchRes;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.match.repository.MostChampionStatRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.dto.MemberRefreshStatusRes;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MemberRepository memberRepository;
    private final MemberStatRepository memberStatRepository;
    private final MostChampionStatRepository mostChampionStatRepository;
    private final RiotApiService riotApiService;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public List<MatchRes> getMatchHistory(Long memberId, Pageable pageable) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String puuid = member.getPuuid();
        if (puuid == null || puuid.isEmpty()) {
            throw new IllegalArgumentException("회원의 PUUID 정보가 없습니다. (Riot 계정 미연동)");
        }

        // Optimization: If member match history has never been updated, return empty
        if (member.getUpdatedAt() == null) {
            return java.util.Collections.emptyList();
        }

        Page<MatchDocument> matches = matchRepository.findAllByPuuid(puuid, pageable);

        return matches.stream()
                .map(match -> convertToMatchRes(match, puuid))
                .filter(res -> res != null)
                .collect(Collectors.toList());
    }

    public MemberRefreshStatusRes getRefreshStatus(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        boolean isRefreshing = Boolean.TRUE.equals(redisTemplate.hasKey("LOCK:MATCH:" + username));
        long remaining = 0;

        if (member.getUpdatedAt() != null) {
            long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toSeconds();
            if (diff < 120) {
                remaining = 120 - diff;
            }
        }

        return new MemberRefreshStatusRes(isRefreshing, remaining);
    }

    public String refreshMemberData(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Cooldown Check
        if (member.getUpdatedAt() != null) {
            long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toSeconds();
            if (diff < 120) { // 2 minutes
                return "2분 쿨타임이 적용 중입니다. 잠시 후 다시 시도해주세요.";
            }
        }

        // 2. Redis Lock Check
        String lockKey = "LOCK:MATCH:" + member.getUsername();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            return "Update already in progress.";
        }

        // 3. Set Lock (10 min TTL)
        redisTemplate.opsForValue().set(lockKey, "LOCKED", Duration.ofMinutes(10));

        try {
            // 4. Update Time Immediately (Separate Transaction)
            updateMemberUpdatedAt(member);

            // 5. External API Call & Analysis
            String apiResult = riotApiService.refreshMatches(member);
            log.info("Riot API Refresh Result for {}: {}", member.getUsername(), apiResult);

            analyzeAndSetPositions(member);
            updateMemberStats(member.getId());
            updateMostChampions(member); // Feature: Most Champion Calculation

            return "전적 갱신이 완료되었습니다.";

        } catch (Exception e) {
            log.error("Refresh failed for member {}", member.getUsername(), e);
            throw new RuntimeException("전적 갱신 실패: " + e.getMessage(), e);
        } finally {
            // 6. Release Lock
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void updateMemberUpdatedAt(Member member) {
        member.refreshUpdatedAt();
        memberRepository.save(member);
    }

    @Transactional
    public void analyzeAndSetPositions(Member member) {
        log.info("Analyzing positions for PUUID: {}", member.getPuuid());

        List<MatchDocument> matches = matchRepository.findAllByPuuid(member.getPuuid());

        if (matches.isEmpty()) {
            return;
        }

        Map<Position, Integer> positionCounts = new HashMap<>();

        for (MatchDocument match : matches) {
            Map<String, Object> data = match.getData();
            if (data == null)
                continue;

            Map<String, Object> info = (Map<String, Object>) data.get("info");
            if (info == null)
                continue;

            List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");
            if (participants == null)
                continue;

            for (Map<String, Object> p : participants) {
                if (member.getPuuid().equals(p.get("puuid"))) {
                    String teamPosition = (String) p.get("teamPosition");
                    Position pos = mapToPosition(teamPosition);
                    if (pos != null) {
                        positionCounts.put(pos, positionCounts.getOrDefault(pos, 0) + 1);
                    }
                    break;
                }
            }
        }

        List<Map.Entry<Position, Integer>> sorted = new ArrayList<>(positionCounts.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        Position mainPos = null;
        Position subPos = null;

        if (member.getMainPosition() == null && !sorted.isEmpty()) {
            mainPos = sorted.get(0).getKey();
        }

        if (member.getSubPosition() == null && sorted.size() > 1) {
            subPos = sorted.get(1).getKey();
        }

        if (mainPos != null || subPos != null) {
            member.updateProfile(mainPos, subPos);
            memberRepository.save(member);
        }
    }

    @Transactional
    public void updateMemberStats(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        MemberStat stat = memberStatRepository.findByMemberId(memberId)
                .orElse(MemberStat.builder().memberId(memberId).build());

        List<MatchDocument> matches = matchRepository.findAllByPuuid(member.getPuuid());
        matches.sort((a, b) -> Long.compare(b.getGameCreation(), a.getGameCreation()));

        int totalWins = 0;
        int totalLosses = 0;
        int recentWins = 0;
        int recentLosses = 0;
        int recentCount = 0;

        for (MatchDocument match : matches) {
            boolean isWin = checkWin(match, member.getPuuid());
            if (isWin)
                totalWins++;
            else
                totalLosses++;

            if (recentCount < 20) {
                if (isWin)
                    recentWins++;
                else
                    recentLosses++;
                recentCount++;
            }
        }

        BigDecimal rankWinRate = calculateWinRate(totalWins, totalLosses);
        BigDecimal recentWinRate = calculateWinRate(recentWins, recentLosses);

        Map<String, Object> leagueInfo = riotApiService.getLeagueInfoByPuuid(member.getPuuid());
        String tier = (String) leagueInfo.get("tier");
        String rankStr = (String) leagueInfo.get("rank");
        String fullRank = (tier != null && rankStr != null) ? tier + " " + rankStr : null;
        Integer leaguePoints = (Integer) leagueInfo.get("leaguePoints");
        Integer rankWins = (Integer) leagueInfo.get("wins");
        Integer rankLosses = (Integer) leagueInfo.get("losses");

        BigDecimal rankTotalWinRate = null;
        if (rankWins != null && rankLosses != null) {
            rankTotalWinRate = calculateWinRate(rankWins, rankLosses);
        } else {
            rankWins = totalWins;
            rankLosses = totalLosses;
            rankTotalWinRate = rankWinRate;
        }

        stat.updateProfile(
                fullRank, leaguePoints, rankTotalWinRate, rankWins, rankLosses, recentWinRate, recentWins,
                recentLosses);
        memberStatRepository.save(stat);
    }

    @Transactional
    public void updateMostChampions(Member member) {
        List<MatchDocument> matches = matchRepository.findAllByPuuid(member.getPuuid());

        // Champion Stats Map: ChampionId -> Stats
        Map<Integer, ChampionStats> statsMap = new HashMap<>();

        for (MatchDocument match : matches) {
            Map<String, Object> data = match.getData();
            if (data == null)
                continue;
            Map<String, Object> info = (Map<String, Object>) data.get("info");
            if (info == null)
                continue;
            List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");
            if (participants == null)
                continue;

            for (Map<String, Object> p : participants) {
                if (member.getPuuid().equals(p.get("puuid"))) {
                    Integer championId = (Integer) p.get("championId");
                    String championName = (String) p.get("championName");
                    boolean win = (boolean) p.get("win");
                    int kills = ((Number) p.get("kills")).intValue();
                    int deaths = ((Number) p.get("deaths")).intValue();
                    int assists = ((Number) p.get("assists")).intValue();

                    statsMap.computeIfAbsent(championId, k -> new ChampionStats(championId, championName))
                            .addGame(win, kills, deaths, assists);
                    break;
                }
            }
        }

        // Convert to MostChampion List & Sort
        List<MostChampion> mostChampions = statsMap.values().stream()
                .map(ChampionStats::toMostChampion)
                .sorted((a, b) -> {
                    if (a.getTotalGames() != b.getTotalGames()) {
                        return b.getTotalGames() - a.getTotalGames(); // Games desc
                    }
                    return Double.compare(b.getWinRate(), a.getWinRate()); // WinRate desc
                })
                .limit(3) // Limit to Top 3
                .collect(Collectors.toList());

        // Save to DB (Overwrite)
        MostChampionStat stat = mostChampionStatRepository.findByMemberId(member.getId())
                .orElse(MostChampionStat.builder().memberId(member.getId()).build());

        // Use Builder to update the list, need to create new object or setter if not
        // exists,
        // but since it's @Builder on class level, it's immutable.
        // Let's assume we can just save a new one with the same ID or delete and
        // re-insert.
        // Or better, let's make MostChampionStat mutable or create a new instance with
        // same ID.

        MostChampionStat newStat = MostChampionStat.builder()
                .id(stat.getId()) // Keep existing ID if present
                .memberId(member.getId())
                .mostChampions(mostChampions)
                .build();

        mostChampionStatRepository.save(newStat);
    }

    // Helper class for aggregation
    private static class ChampionStats {
        int championId;
        String championName;
        int totalGames;
        int totalWins;
        int totalKills;
        int totalDeaths;
        int totalAssists;

        public ChampionStats(int championId, String championName) {
            this.championId = championId;
            this.championName = championName;
        }

        public void addGame(boolean win, int kills, int deaths, int assists) {
            this.totalGames++;
            if (win)
                this.totalWins++;
            this.totalKills += kills;
            this.totalDeaths += deaths;
            this.totalAssists += assists;
        }

        public MostChampion toMostChampion() {
            int losses = totalGames - totalWins;
            double winRate = totalGames > 0 ? (double) totalWins / totalGames * 100 : 0;
            double kda = totalDeaths > 0 ? (double) (totalKills + totalAssists) / totalDeaths
                    : (double) (totalKills + totalAssists); // Perfect KDA handling

            return MostChampion.builder()
                    .championId(championId)
                    .championName(championName)
                    .totalGames(totalGames)
                    .totalWins(totalWins)
                    .totalLosses(losses)
                    .winRate(Math.round(winRate * 10.0) / 10.0)
                    .kda(Math.round(kda * 100.0) / 100.0)
                    .build();
        }
    }

    private boolean checkWin(MatchDocument match, String puuid) {
        Map<String, Object> data = match.getData();
        if (data == null || !data.containsKey("info"))
            return false;

        Map<String, Object> info = (Map<String, Object>) data.get("info");
        List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");

        for (Map<String, Object> p : participants) {
            if (puuid.equals(p.get("puuid"))) {
                return (boolean) p.get("win");
            }
        }
        return false;
    }

    private BigDecimal calculateWinRate(int wins, int losses) {
        int total = wins + losses;
        if (total == 0)
            return BigDecimal.ZERO;
        return BigDecimal.valueOf(wins)
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private Position mapToPosition(String teamPosition) {
        if (teamPosition == null)
            return null;
        switch (teamPosition) {
            case "TOP":
                return Position.TOP;
            case "JUNGLE":
                return Position.JUNGLE;
            case "MIDDLE":
                return Position.MID;
            case "BOTTOM":
                return Position.BOT;
            case "UTILITY":
                return Position.SUP;
            default:
                return null;
        }
    }

    private MatchRes convertToMatchRes(MatchDocument match, String puuid) {
        try {
            Map<String, Object> data = match.getData();
            if (data == null)
                return null;

            Map<String, Object> info = (Map<String, Object>) data.get("info");
            if (info == null)
                return null;

            Long gameCreation = ((Number) info.get("gameCreation")).longValue();
            Long gameDuration = ((Number) info.get("gameDuration")).longValue();
            String gameMode = (String) info.get("gameMode");

            List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");
            if (participants == null)
                return null;

            Map<String, Object> myData = null;
            for (Map<String, Object> p : participants) {
                if (puuid.equals(p.get("puuid"))) {
                    myData = p;
                    break;
                }
            }

            if (myData == null)
                return null;

            String championName = (String) myData.get("championName");
            Integer championId = (Integer) myData.get("championId");
            int kills = ((Number) myData.get("kills")).intValue();
            int deaths = ((Number) myData.get("deaths")).intValue();
            int assists = ((Number) myData.get("assists")).intValue();
            boolean win = (boolean) myData.get("win");

            double kda = 0.0;
            if (deaths == 0)
                kda = (double) (kills + assists);
            else
                kda = (double) (kills + assists) / deaths;
            kda = Math.round(kda * 100.0) / 100.0;

            return MatchRes.builder()
                    .matchId(match.getMatchId())
                    .gameCreation(gameCreation)
                    .gameDuration(gameDuration)
                    .gameMode(gameMode)
                    .championName(championName)
                    .championId(championId)
                    .kills(kills)
                    .deaths(deaths)
                    .assists(assists)
                    .kda(kda)
                    .win(win)
                    .build();

        } catch (Exception e) {
            log.warn("Error converting match {} for puuid {}", match.getMatchId(), puuid, e);
            return null;
        }
    }
}
