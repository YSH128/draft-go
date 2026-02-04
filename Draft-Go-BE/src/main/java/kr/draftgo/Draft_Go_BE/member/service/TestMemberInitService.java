package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.member.domain.*;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

/**
 * 개발 환경 초기 데이터 생성 서비스
 * Transactional 어노테이션을 통해 트랜잭션 커밋 후 이벤트가 발행되도록 보장합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestMemberInitService {

    private final MemberRepository memberRepository;
    private final MemberStatRepository memberStatRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 개발 환경 초기 데이터 생성
     * 트랜잭션이 커밋된 후에 이벤트가 발행됩니다.
     */
    @Transactional
    public int initializeDevData() {
        Random random = new Random();
        int createdCount = 0;

        // 관리자 계정 생성
        createdCount += createAdminAccount();

        // 테스트 계정 생성 (test1~test30)
        createdCount += createTestAccounts(random);

        return createdCount;
    }

    /**
     * 관리자 계정 생성
     */
    private int createAdminAccount() {
        if (memberRepository.findByUsername("admin").isEmpty()) {
            Member admin = Member.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin1234"))
                    .gameName("AdminUser")
                    .tagLine("ADMIN")
                    .role(Role.ADMIN)
                    .build();

            admin.updateProfileIcon(50);
            memberRepository.save(admin);
            return 1;
        }
        return 0;
    }

    /**
     * 테스트 계정 생성 (test1~test30)
     */
    private int createTestAccounts(Random random) {
        int createdCount = 0;

        Tier[] tiers = { Tier.IRON, Tier.BRONZE, Tier.SILVER, Tier.GOLD,
                Tier.PLATINUM, Tier.EMERALD, Tier.DIAMOND };
        Division[] divisions = { Division.I, Division.II, Division.III, Division.IV };
        Position[] positions = { Position.TOP, Position.JUNGLE, Position.MID, Position.BOT, Position.SUP };

        // 실제 게임 닉네임 배열 (test1~test20)
        String[][] realAccounts = {
                {"무 잔", "하데스"},
                {"Akaps", "KR1"},
                {"상현 2 차식", "무한성"},
                {"한남맛종욱", "KR1"},
                {"마끼리", "5555"},
                {"9DO DDaHyoNi", "1234"},
                {"달 기", "102"},
                {"멋 사", "KR1"},
                {"임팡벌레", "바텀박사"},
                {"샤프박", "super"},

                {"독침붕", "딱충이"},
                {"DK ShowMaker", "KR1"},
                {"HLE Gumayusi", "0298"},
                {"Keria", "4111"},
                {"허거덩", "0303"},
                {"Hide on bush", "KR1"},
                {"JUGKlNG", "kr"},
                {"kiin", "KR1"},
                {"오너", "111"},
                {"타 잔", "KR1"},

                {"DK Lucid", "KR1"},
                {"Peyz", "KR11"},
                {"Teddy", "sss"},
                {"미북이", "KR1"},
                {"우제초이", "Kr2"},
                {"어리고싶다", "KR1"},
                {"vinaka", "KR1"},
                {"MaRin", "KR1"},
                {"DK Smash", "KR7"},
                {"Mannoroth", "KR1"}
        };

        int testAccountNum = realAccounts.length;

        for (int i = 1; i <= 30; i++) {
            String username = "test" + i;
            if (memberRepository.findByUsername(username).isEmpty()) {
                // 게임 닉네임 설정
                String gameName;
                String tagLine;

                if (i <= testAccountNum) {
                    // 실제 계정
                    gameName = realAccounts[i - 1][0];
                    tagLine = realAccounts[i - 1][1];
                } else {
                    // TestPlayer
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

                // test1~test20만 전적 갱신 시도 (실제 계정)
                if (i <= testAccountNum) {
                    try {
                        log.info("Attempting to refresh match data for {}: {}#{}", username, gameName, tagLine);
                        // 회원가입 이벤트 발행 (트랜잭션 커밋 후 비동기로 통계 정보 수집)
                        eventPublisher.publishEvent(new MemberSignupEvent(savedTestUser));
                    } catch (Exception e) {
                        log.warn("Failed to refresh match data for {}: {}", username, e.getMessage());
                        // 전적 갱신 실패해도 계정 생성은 계속 진행
                    }
                } else {
                    // 더미 통계 생성
                    MemberStat testStat = MemberStat.builder()
                            .member(savedTestUser)
                            .seasonId("1601")
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
                }
                createdCount++;
            }
        }

        return createdCount;
    }
}
