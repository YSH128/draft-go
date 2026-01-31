package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.match.service.MatchService;
import kr.draftgo.Draft_Go_BE.member.domain.*;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

/**
 * Dev 프로파일에서만 실행되는 초기 데이터 설정 클래스
 * 개발 환경에서 테스트용 관리자 계정과 샘플 사용자를 자동 생성합니다.
 */
@Slf4j
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DevDataInitializer {

    private final MemberRepository memberRepository;
    private final MemberStatRepository memberStatRepository;
    private final SeasonRepository seasonRepository;
    private final PasswordEncoder passwordEncoder;
    private final MatchService matchService;

    @Bean
    public ApplicationRunner initializeDevData() {
        return args -> {
            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 시작");
            log.info("========================================");

            Random random = new Random();
            int createdCount = 0;

            // 관리자 계정 creation
            if (memberRepository.findByUsername("admin").isEmpty()) {
                Member admin = Member.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin1234"))
                        .gameName("AdminUser")
                        .tagLine("ADMIN")
                        .role(Role.ADMIN)
                        .build();

                // profileIconId 설정
                admin.updateProfileIcon(50);

                memberRepository.save(admin);
                createdCount++;
            }

            // test1 ~ test30 사용자 생성
            Tier[] tiers = { Tier.IRON, Tier.BRONZE, Tier.SILVER, Tier.GOLD,
                    Tier.PLATINUM, Tier.EMERALD, Tier.DIAMOND };
            Division[] divisions = { Division.I, Division.II, Division.III, Division.IV };
            Position[] positions = { Position.TOP, Position.JUNGLE, Position.MID, Position.BOT, Position.SUP };

            // 실제 게임 닉네임 배열 (test1~test10)
            String[][] realAccounts = {
                {"무 잔", "하데스"},       // test1
                {"Akaps", "KR1"},         // test2
                {"상현 2 차식", "무한성"},  // test3
                {"한남맛종욱", "KR1"},     // test4
                {"마끼리", "5555"},       // test5
                {"9DO DDaHyoNi", "1234"}, // test6
                {"달 기", "102"},         // test7
                {"멋 사", "KR1"},         // test8
                {"임팡벌레", "바텀박사"},   // test9
                {"샤프박", "super"}       // test10
            };

            for (int i = 1; i <= 30; i++) {
                String username = "test" + i;
                if (memberRepository.findByUsername(username).isEmpty()) {
                    // 게임 닉네임 설정
                    String gameName;
                    String tagLine;

                    if (i <= 10) {
                        // test1~test10: 실제 계정
                        gameName = realAccounts[i - 1][0];
                        tagLine = realAccounts[i - 1][1];
                    } else {
                        // test11~test30: TestPlayer
                        gameName = "TestPlayer" + i;
                        tagLine = "KR1";
                    }

                    // 랜덤 티어/디비전 선택
                    Tier randomTier = tiers[random.nextInt(tiers.length)];
                    Division randomDivision = divisions[random.nextInt(divisions.length)];

                    // 랜덤 포지션 선택
                    Position mainPos = positions[random.nextInt(positions.length)];
                    Position subPos = positions[random.nextInt(positions.length)];

                    // 랜덤 스탯 생성
                    int leaguePoint = random.nextInt(100); // 0-99 LP
                    int rankWins = 50 + random.nextInt(200); // 50-249 wins
                    int rankLosses = 40 + random.nextInt(180); // 40-219 losses
                    double rankWinRate = (double) rankWins / (rankWins + rankLosses) * 100;

                    int recentWins = random.nextInt(20); // 0-19 recent wins
                    int recentLosses = 20 - recentWins; // total 20 recent games
                    double recentWinRate = (double) recentWins / 20 * 100;

                    Member testUser = Member.builder()
                            .username(username)
                            .password(passwordEncoder.encode("user1234"))
                            .gameName(gameName)
                            .tagLine(tagLine)
                            .mainPosition(mainPos)
                            .subPosition(subPos)
                            .build();

                    // profileIconId 설정 (1~30)
                    testUser.updateProfileIcon(i);

                    Member savedTestUser = memberRepository.save(testUser);

                    MemberStat testStat = MemberStat.builder()
                            .member(savedTestUser)
                            .seasonId("1401")
                            .tier(randomTier)
                            .division(randomDivision)
                            .leaguePoint(leaguePoint)
                            .rankWinRate(BigDecimal.valueOf(rankWinRate).setScale(2, RoundingMode.HALF_UP))
                            .rankWins(rankWins)
                            .rankLoseRate(rankLosses)
                            .lastedWinRate(BigDecimal.valueOf(recentWinRate).setScale(2, RoundingMode.HALF_UP))
                            .lastedWins(recentWins)
                            .lastedLosses(recentLosses)
                            .build();
                    memberStatRepository.save(testStat);
                    createdCount++;

                    // test1~test10만 전적 갱신 시도 (실제 계정)
                    if (i <= 10) {
                        try {
                            log.info("Attempting to refresh match data for {}: {}#{}", username, gameName, tagLine);
                            matchService.refreshMemberData(savedTestUser.getId());
                        } catch (Exception e) {
                            log.warn("Failed to refresh match data for {}: {}", username, e.getMessage());
                            // 전적 갱신 실패해도 계정 생성은 계속 진행
                        }
                    }
                }
            }

            log.info("========================================");
            log.info("✓ 총 {}개 계정 생성 완료 (admin: 1, test1~test30: {})", createdCount, createdCount - 1);
            log.info("  - 계정 정보: 비밀번호 user1234 (admin: admin1234)");
            log.info("  - ProfileIconId: admin=50, test1~test30=1~30");
            log.info("  - test1~test10: 실제 라이엇 계정 (전적 갱신 시도)");
            log.info("  - test11~test30: 더미 계정 (TestPlayer)");
            log.info("========================================");
        };
    }
}
