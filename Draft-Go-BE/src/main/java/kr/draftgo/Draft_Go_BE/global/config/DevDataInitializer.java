package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Rank;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

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
                    .rank(Rank.DIAMOND_2)
                    .leaguePoint(75)
                    .build();
            memberRepository.save(user1);
            log.info("✓ 샘플 사용자1 생성: user1 / user123 (MID/BOT, 다이아2)");

            // 샘플 사용자 2
            Member user2 = Member.builder()
                    .username("user2")
                    .password(passwordEncoder.encode("user456"))
                    .gameName("Player2")
                    .tagLine("KR2")
                    .mainPosition(Position.TOP)
                    .subPosition(Position.JUNGLE)
                    .rank(Rank.PLATINUM_1)
                    .leaguePoint(90)
                    .build();
            memberRepository.save(user2);
            log.info("✓ 샘플 사용자2 생성: user2 / user456 (TOP/정글, 플래1)");

            // 샘플 사용자 3
            Member user3 = Member.builder()
                    .username("user3")
                    .password(passwordEncoder.encode("user789"))
                    .gameName("Player3")
                    .tagLine("KR3")
                    .mainPosition(Position.BOT)
                    .rank(Rank.GOLD_2)
                    .leaguePoint(45)
                    .build();
            memberRepository.save(user3);
            log.info("✓ 샘플 사용자3 생성: user3 / user789 (ADC, 골드2)");

            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 완료");
            log.info("========================================");
        };
    }
}
