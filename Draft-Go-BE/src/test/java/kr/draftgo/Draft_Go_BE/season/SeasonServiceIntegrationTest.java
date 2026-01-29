package kr.draftgo.Draft_Go_BE.season;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.match.service.MatchService;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import kr.draftgo.Draft_Go_BE.member.service.SeasonAutomationService;
import kr.draftgo.Draft_Go_BE.member.service.SeasonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

@SpringBootTest
@Transactional
public class SeasonServiceIntegrationTest {

    @Autowired
    private SeasonService seasonService;

    @Autowired
    private SeasonAutomationService seasonAutomationService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberStatRepository memberStatRepository;

    @Autowired
    private SeasonRepository seasonRepository;

    @MockitoBean
    private RiotApiService riotApiService;

    @MockitoBean
    private DataDragonService dataDragonService;

    private Member testMember;

    @BeforeEach
    void setUp() {
        // Clear conflicting data (Use deleteAllInBatch for JPA to bypass invalid enum
        // mapping)
        matchRepository.deleteAll(); // MongoDB
        memberStatRepository.deleteAllInBatch(); // JPA
        seasonRepository.deleteAll(); // MongoDB
        memberRepository.deleteAllInBatch(); // JPA

        // Create Test Member
        testMember = memberRepository.save(Member.builder()
                .username("testuser")
                .password("dummy123") // Required field
                .gameName("Hide on bush")
                .tagLine("KR1")
                .puuid("test-puuid")
                .build());

        // Create Initial Active Season 1601 (Start 16.1)
        SeasonDocument s1601 = SeasonDocument.builder()
                .seasonId("1601")
                .seasonName("Season 16 Split 1")
                .startVersion("16.1")
                .startTime(LocalDateTime.now().minusMonths(2))
                .isActive(true)
                .build();
        seasonRepository.save(s1601);
        seasonService.refreshCache();
    }

    @Test
    @DisplayName("시나리오 A: 버전이 올라가도(16.2) 랭크 초기화가 없으면 1601 시즌에 합산된다")
    void testRegularPatch_NoNewSeason() {
        // Given
        String currentVersion = "16.2.1";
        given(dataDragonService.getVersion()).willReturn(currentVersion);

        // Mock: Challenger League has entries (No Reset)
        given(riotApiService.getChallengerLeague("RANKED_SOLO_5x5"))
                .willReturn(Map.of("entries", List.of("faker", "chovy")));

        // Mock: Riot API Refresh returns nothing (we manually insert matches)
        given(riotApiService.refreshMatches(Mockito.any())).willReturn("Updated");

        // Prepare Match: Version 16.2.1
        MatchDocument match16_2 = createMatch("MATCH-16.2", "16.2.1");
        matchRepository.save(match16_2);

        // When: 1. Automation Runs
        seasonAutomationService.checkSeasonUpdate();

        // Then: Season 1601 should still be active, No 1602
        assertThat(seasonService.getActiveSeason().getSeasonId()).isEqualTo("1601");
        assertThat(seasonRepository.findById("1602")).isEmpty();

        // When: 2. Stats Update
        matchService.updateMemberStats(testMember.getId());

        // Then: MemberStat should exist for 1601
        List<MemberStat> stats = memberStatRepository.findAll();
        assertThat(stats).hasSize(1);
        assertThat(stats.get(0).getSeasonId()).isEqualTo("1601");
        // Verify win count (1 win)
        assertThat(stats.get(0).getRankWins()).isEqualTo(1);
    }

    @Test
    @DisplayName("시나리오 B: 랭크 초기화(16.9)가 감지되면 새 시즌(1602)이 생성되고 전적이 분리된다")
    void testRankReset_NewSeasonCreated() {
        // Given: 16.9.1 Update
        String currentVersion = "16.9.1";
        given(dataDragonService.getVersion()).willReturn(currentVersion);

        // Mock: Challenger League is EMPTY (Reset Detected)
        given(riotApiService.getChallengerLeague("RANKED_SOLO_5x5"))
                .willReturn(Map.of("entries", Collections.emptyList()));

        // Mock: Riot Refresh
        given(riotApiService.refreshMatches(Mockito.any())).willReturn("Updated");

        // Prepare Match: Version 16.9.1
        MatchDocument match16_9 = createMatch("MATCH-16.9", "16.9.1");
        matchRepository.save(match16_9);

        // When: Automation Runs
        seasonAutomationService.checkSeasonUpdate();

        // Then: New Season 1602 should be created and Active
        seasonService.refreshCache(); // Ensure cache is visible
        SeasonDocument active = seasonService.getActiveSeason();
        assertThat(active.getSeasonId()).isEqualTo("1602");
        assertThat(active.getStartVersion()).isEqualTo("16.9");

        // 1601 should be inactive
        SeasonDocument oldSeason = seasonRepository.findById("1601").orElseThrow();
        assertThat(oldSeason.isActive()).isFalse();

        // When: Stats Update
        matchService.updateMemberStats(testMember.getId());

        // Then: MemberStat should exist for 1602
        MemberStat stat1602 = memberStatRepository.findByMemberIdAndSeasonId(testMember.getId(), "1602").orElse(null);
        assertThat(stat1602).isNotNull();
        assertThat(stat1602.getRankWins()).isEqualTo(1);

        // Check if old stats for 1601 exist (should be 0 or separate if we added
        // matches before)
        // In this isolation test, we didn't add 16.1 matches, so 1601 stat might not be
        // created or empty.
    }

    @Test
    @DisplayName("시나리오 C: 1601(Regular) -> 1602(Reset) -> 1603 데이터 분리 확인")
    void testFullCycle() {
        // [Step 1] 16.1 ~ 16.8 (Season 1601)
        given(dataDragonService.getVersion()).willReturn("16.8.1");
        given(riotApiService.getChallengerLeague(anyString())).willReturn(Map.of("entries", List.of("user"))); // Not
                                                                                                               // Empty

        MatchDocument m1 = createMatch("MATCH-1", "16.1.1");
        MatchDocument m2 = createMatch("MATCH-2", "16.5.1");
        matchRepository.saveAll(List.of(m1, m2));

        seasonAutomationService.checkSeasonUpdate();
        matchService.updateMemberStats(testMember.getId());

        // Assert 1601: 2 Wins
        MemberStat s1 = memberStatRepository.findByMemberIdAndSeasonId(testMember.getId(), "1601").orElseThrow();
        assertThat(s1.getRankWins()).isEqualTo(2);

        // [Step 2] 16.9 Rank Reset -> Season 1602
        given(dataDragonService.getVersion()).willReturn("16.9.1");
        given(riotApiService.getChallengerLeague(anyString())).willReturn(Map.of("entries", Collections.emptyList())); // Reset

        MatchDocument m3 = createMatch("MATCH-3", "16.9.1");
        matchRepository.save(m3);

        seasonAutomationService.checkSeasonUpdate(); // Should create 1602
        matchService.updateMemberStats(testMember.getId());

        // Assert 1602: 1 Win
        MemberStat s2 = memberStatRepository.findByMemberIdAndSeasonId(testMember.getId(), "1602").orElseThrow();
        assertThat(s2.getRankWins()).isEqualTo(1);

        // Assert 1601: Still 2 Wins (Unchanged)
        MemberStat s1_check = memberStatRepository.findByMemberIdAndSeasonId(testMember.getId(), "1601").orElseThrow();
        assertThat(s1_check.getRankWins()).isEqualTo(2);

        // Check Active Season ID Logic (Increment)
        assertThat(seasonService.getActiveSeason().getSeasonId()).isEqualTo("1602");
    }

    private MatchDocument createMatch(String matchId, String gameVersion) {
        Map<String, Object> participant = new java.util.HashMap<>();
        participant.put("puuid", testMember.getPuuid());
        participant.put("win", true);
        participant.put("kills", 10);
        participant.put("deaths", 2);
        participant.put("assists", 5);
        participant.put("championId", 100);
        participant.put("championName", "Garen");
        participant.put("item0", 0);
        participant.put("item1", 0);
        participant.put("item2", 0);
        participant.put("item3", 0);
        participant.put("item4", 0);
        participant.put("item5", 0);
        participant.put("item6", 0);
        participant.put("summoner1Id", 4);
        participant.put("summoner2Id", 6);
        participant.put("totalMinionsKilled", 100);
        participant.put("neutralMinionsKilled", 0);
        participant.put("champLevel", 18);
        participant.put("teamPosition", "TOP");

        return MatchDocument.builder()
                .matchId(matchId)
                .gameCreation(System.currentTimeMillis())
                .gameMode("CLASSIC")
                .data(Map.of("info", Map.of(
                        "gameVersion", gameVersion,
                        "gameCreation", System.currentTimeMillis(),
                        "gameDuration", 1200,
                        "gameMode", "CLASSIC",
                        "participants", List.of(participant))))
                .build();
    }
}
