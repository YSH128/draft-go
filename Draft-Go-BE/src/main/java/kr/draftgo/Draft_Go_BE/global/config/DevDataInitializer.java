package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.member.service.TestMemberInitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Dev 프로파일에서만 실행되는 초기 데이터 설정 클래스
 * 개발 환경에서 테스트용 관리자 계정과 샘플 사용자를 자동 생성합니다.
 */
@Slf4j
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DevDataInitializer {

    private final TestMemberInitService testMemberInitService;

    @Bean
    public ApplicationRunner initializeDevData() {
        return args -> {
            log.info("========================================");
            log.info("개발 환경 초기 데이터 생성 시작");
            log.info("========================================");

            int createdCount = testMemberInitService.initializeDevData();

            log.info("========================================");
            log.info("✓ 총 {}개 계정 생성 완료", createdCount);
            log.info("  - 계정 정보: 비밀번호 user1234 (admin: admin1234)");
            log.info("  - ProfileIconId: admin=50, test1~test30=1~30");
            log.info("  - test1~test20: 실제 라이엇 계정 (전적 갱신 시도)");
            log.info("  - test21~test30: 더미 계정 (TestPlayer)");
            log.info("========================================");
        };
    }
}
