package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

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
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initializeDevData() {
        return args -> {
            // 기존 데이터가 있으면 초기화하지 않음
            if (memberRepository.count() > 0) {
                log.info("개발 환경 초기화 데이터가 이미 존재합니다. 스킵합니다.");
                return;
            }

            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 시작");
            log.info("========================================");

            // 관리자 계정
            Member admin = Member.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .gameName("AdminUser")
                    .tagLine("ADMIN")
                    .build();
            memberRepository.save(admin);
            log.info("✓ 관리자 계정 생성: admin / admin123");

            // 샘플 사용자 1
            Member user1 = Member.builder()
                    .username("user1")
                    .password(passwordEncoder.encode("user123"))
                    .gameName("Player1")
                    .tagLine("KR1")
                    .mainPosition(Position.MID)
                    .subPosition(Position.BOT)
                    .build();
            Member savedUser1 = memberRepository.save(user1);

            MemberStat stat1 = MemberStat.builder()
                    .memberId(savedUser1.getId())
                    .rank("DIAMOND_2")
                    .leaguePoint(75)
                    .rankWinRate(new BigDecimal("52.50"))
                    .rankWins(120)
                    .rankLoseRate(110)
                    .lastedWinRate(new BigDecimal("48.30"))
                    .lastedWins(45)
                    .lastedLosses(48)
                    .build();
            memberStatRepository.save(stat1);
            log.info("✓ 샘플 사용자1 생성: user1 / user123 (MID/BOT, 다이아2)");

            // 샘플 사용자 2
            Member user2 = Member.builder()
                    .username("user2")
                    .password(passwordEncoder.encode("user456"))
                    .gameName("Player2")
                    .tagLine("KR2")
                    .mainPosition(Position.TOP)
                    .subPosition(Position.JUNGLE)
                    .build();
            Member savedUser2 = memberRepository.save(user2);

            MemberStat stat2 = MemberStat.builder()
                    .memberId(savedUser2.getId())
                    .rank("PLATINUM_1")
                    .leaguePoint(90)
                    .rankWinRate(new BigDecimal("55.20"))
                    .rankWins(95)
                    .rankLoseRate(77)
                    .lastedWinRate(new BigDecimal("51.40"))
                    .lastedWins(36)
                    .lastedLosses(34)
                    .build();
            memberStatRepository.save(stat2);
            log.info("✓ 샘플 사용자2 생성: user2 / user456 (TOP/정글, 플래1)");

            // 샘플 사용자 3
            Member user3 = Member.builder()
                    .username("user3")
                    .password(passwordEncoder.encode("user789"))
                    .gameName("Player3")
                    .tagLine("KR3")
                    .mainPosition(Position.BOT)
                    .build();
            Member savedUser3 = memberRepository.save(user3);

            MemberStat stat3 = MemberStat.builder()
                    .memberId(savedUser3.getId())
                    .rank("GOLD_2")
                    .leaguePoint(45)
                    .rankWinRate(new BigDecimal("49.80"))
                    .rankWins(62)
                    .rankLoseRate(62)
                    .lastedWinRate(new BigDecimal("45.60"))
                    .lastedWins(23)
                    .lastedLosses(27)
                    .build();
            memberStatRepository.save(stat3);
            log.info("✓ 샘플 사용자3 생성: user3 / user789 (ADC, 골드2)");

            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 완료");
            log.info("========================================");
        };
    }
}
