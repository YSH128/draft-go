package kr.draftgo.Draft_Go_BE.global.config;

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

    @Bean
    public ApplicationRunner initializeDevData() {
        return args -> {
            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 시작");
            log.info("========================================");

            Random random = new Random();

            // 관리자 계정 creation
            if (memberRepository.findByUsername("admin").isEmpty()) {
                Member admin = Member.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin1234"))
                        .gameName("AdminUser")
                        .tagLine("ADMIN")
                        .role(Role.ADMIN)
                        .build();
                memberRepository.save(admin);
                log.info("✓ 관리자 계정 생성: admin / admin1234 (ADMIN)");
            } else {
                log.info("⊙ 관리자 계정 이미 존재 - 스킵");
            }

            // 샘플 사용자 1
            if (memberRepository.findByUsername("user1").isEmpty()) {
                Member user1 = Member.builder()
                        .username("user1")
                        .password(passwordEncoder.encode("user1234"))
                        .gameName("Player1")
                        .tagLine("KR1")
                        .mainPosition(Position.MID)
                        .subPosition(Position.BOT)
                        .build();
                Member savedUser1 = memberRepository.save(user1);

                MemberStat stat1 = MemberStat.builder()
                        .memberId(savedUser1.getId())
                        .seasonId("1401")
                        .tier(Tier.DIAMOND)
                        .division(Division.II)
                        .leaguePoint(75)
                        .rankWinRate(new BigDecimal("52.50"))
                        .rankWins(120)
                        .rankLoseRate(110)
                        .lastedWinRate(new BigDecimal("48.30"))
                        .lastedWins(45)
                        .lastedLosses(48)
                        .build();
                memberStatRepository.save(stat1);
                log.info("✓ 샘플 사용자1 생성: user1 / user1234 (MID/BOT, 다이아2)");
            } else {
                log.info("⊙ user1 이미 존재 - 스킵");
            }

            // 샘플 사용자 2
            if (memberRepository.findByUsername("user2").isEmpty()) {
                Member user2 = Member.builder()
                        .username("user2")
                        .password(passwordEncoder.encode("user1234"))
                        .gameName("Player2")
                        .tagLine("KR2")
                        .mainPosition(Position.TOP)
                        .subPosition(Position.JUNGLE)
                        .build();
                Member savedUser2 = memberRepository.save(user2);

                MemberStat stat2 = MemberStat.builder()
                        .memberId(savedUser2.getId())
                        .seasonId("1401")
                        .tier(Tier.PLATINUM)
                        .division(Division.I)
                        .leaguePoint(90)
                        .rankWinRate(new BigDecimal("55.20"))
                        .rankWins(95)
                        .rankLoseRate(77)
                        .lastedWinRate(new BigDecimal("51.40"))
                        .lastedWins(36)
                        .lastedLosses(34)
                        .build();
                memberStatRepository.save(stat2);
                log.info("✓ 샘플 사용자2 생성: user2 / user1234 (TOP/정글, 플래1)");
            } else {
                log.info("⊙ user2 이미 존재 - 스킵");
            }

            // 샘플 사용자 3
            if (memberRepository.findByUsername("user3").isEmpty()) {
                Member user3 = Member.builder()
                        .username("user3")
                        .password(passwordEncoder.encode("user1234"))
                        .gameName("Player3")
                        .tagLine("KR3")
                        .mainPosition(Position.BOT)
                        .build();
                Member savedUser3 = memberRepository.save(user3);

                MemberStat stat3 = MemberStat.builder()
                        .memberId(savedUser3.getId())
                        .seasonId("1401")
                        .tier(Tier.GOLD)
                        .division(Division.II)
                        .leaguePoint(45)
                        .rankWinRate(new BigDecimal("49.80"))
                        .rankWins(62)
                        .rankLoseRate(62)
                        .lastedWinRate(new BigDecimal("45.60"))
                        .lastedWins(23)
                        .lastedLosses(27)
                        .build();
                memberStatRepository.save(stat3);
                log.info("✓ 샘플 사용자3 생성: user3 / user1234 (ADC, 골드2)");
            } else {
                log.info("⊙ user3 이미 존재 - 스킵");
            }

            // test1 ~ test10 사용자 생성
            Tier[] tiers = { Tier.IRON, Tier.BRONZE, Tier.SILVER, Tier.GOLD,
                    Tier.PLATINUM, Tier.EMERALD, Tier.DIAMOND };
            Division[] divisions = { Division.I, Division.II, Division.III, Division.IV };
            Position[] positions = { Position.TOP, Position.JUNGLE, Position.MID, Position.BOT, Position.SUP };

            for (int i = 1; i <= 10; i++) {
                String username = "test" + i;
                if (memberRepository.findByUsername(username).isEmpty()) {
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
                            .gameName("TestPlayer" + i)
                            .tagLine("KR1")
                            .mainPosition(mainPos)
                            .subPosition(subPos)
                            .build();
                    Member savedTestUser = memberRepository.save(testUser);

                    MemberStat testStat = MemberStat.builder()
                            .memberId(savedTestUser.getId())
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

                    log.info("✓ 테스트 사용자{} 생성: {} / user1234 ({}/{}, {} {})",
                            i, username, mainPos, subPos, randomTier.getDisplayName(), randomDivision.getDisplayName());
                } else {
                    log.info("⊙ {} 이미 존재 - 스킵", username);
                }
            }

            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 완료");
            log.info("========================================");
        };
    }
}
