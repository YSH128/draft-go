package kr.draftgo.Draft_Go_BE.member.service;

import jakarta.annotation.PostConstruct;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 시즌 자동화 서비스
 * - 서버 시작 시 초기 시즌 생성 (Bootstrap)
 * - 주기적으로 버전 업데이트 및 챌린저 리그 초기화 감지 -> 새 시즌 생성 (Auto-Reset)
 * - SeasonService와 RiotApiService 간의 순환 참조 방지를 위해 분리됨.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeasonAutomationService {

    private final SeasonService seasonService;
    private final DataDragonService dataDragonService;
    private final RiotApiService riotApiService;

    /**
     * [Bootstrap] 서버 시작 시 DB가 비어있으면 초기 시즌 자동 생성
     * DataDragon에서 최신 버전을 가져와서 SeasonService에 전달합니다.
     */
    // @PostConstruct
    public void bootstrap() {
        /*
         * try {
         * // DataDragon 버전이 로드될 때까지 잠시 대기하거나 재시도하는 로직이 필요할 수 있으나,
         * // DataDragonService도 @PostConstruct에서 로드하므로 의존성 순서에 맡김.
         * String currentVersion = dataDragonService.getVersion();
         * if (currentVersion == null || "latest".equals(currentVersion)) {
         * log.warn("[Automation] DataDragon version not ready yet. Skipping bootstrap."
         * );
         * return;
         * }
         * 
         * seasonService.createBootstrapSeason(currentVersion);
         * 
         * } catch (Exception e) {
         * log.error("[Automation] Bootstrap failed", e);
         * }
         */
    }

    /**
     * [Auto-Reset] 매 10분마다 실행되어 버전 및 랭크 초기화를 감지
     * 1. 버전 변경 감지 (Major Update) -> 무조건 새 시즌
     * 2. 챌린저 리그 비어있음 (Split Reset) -> 새 시즌
     */
    @Scheduled(cron = "0 */10 * * * *") // 매 10분마다
    public void checkSeasonUpdate() {
        try {
            String currentVersion = dataDragonService.getVersion(); // e.g., "16.2.1"
            SeasonDocument activeSeason = seasonService.getActiveSeason();

            if (activeSeason == null) {
                // 활성 시즌이 없으면 부트스트랩 시도
                bootstrap();
                return;
            }

            String activeStartVersion = activeSeason.getStartVersion(); // e.g., "16.1"

            // 1. 버전 비교 (Major Update Check)
            // 17.x 등 메이저 버전이 바뀌면 무조건 시즌 교체
            if (isMajorUpdate(currentVersion, activeStartVersion)) {
                log.info("[Automation] Major Update Detected ({} -> {}). Creating new season...", activeStartVersion,
                        currentVersion);
                seasonService.createNextSeason(currentVersion);
                return;
            }

            // 2. 챌린저 리그 체크 (Split Reset Check)
            // [Optimization] lastCheckedVersion을 확인하여 이미 확인한 버전은 스킵
            String currentMajorMinor = parseMajorMinor(currentVersion);
            String lastChecked = activeSeason.getLastCheckedVersion();

            // 버전이 달라졌고, 아직 확인하지 않은 새 버전인 경우에만 체크
            if (!activeStartVersion.equals(currentMajorMinor) &&
                    (lastChecked == null || !lastChecked.equals(currentMajorMinor))) {

                log.info("[Automation] New version detected: {}. Checking Challenger League...", currentVersion);
                Map<String, Object> challengerLeague = riotApiService.getChallengerLeague("RANKED_SOLO_5x5");

                if (challengerLeague != null && challengerLeague.containsKey("entries")) {
                    List<?> entries = (List<?>) challengerLeague.get("entries");
                    if (entries == null || entries.isEmpty()) {
                        log.info(
                                "[Automation] Challenger League is Empty! Split Reset Detected. Creating new season...");
                        seasonService.createNextSeason(currentVersion);
                    } else {
                        log.info(
                                "[Automation] Version updated to {}, but Challenger league has {} entries. Regular patch.",
                                currentVersion, entries.size());
                        // 확인 완료: 다음번엔 API 호출 안 하도록 기록
                        seasonService.updateLastCheckedVersion(activeSeason.getSeasonId(), currentMajorMinor);
                    }
                }
            }

        } catch (Exception e) {
            log.error("[Automation] Use Scheduled Task Failed", e);
        }
    }

    private boolean isMajorUpdate(String current, String active) {
        if (current == null || active == null)
            return false;
        try {
            int currentMajor = Integer.parseInt(current.split("\\.")[0]);
            int activeMajor = Integer.parseInt(active.split("\\.")[0]);
            return currentMajor > activeMajor;
        } catch (Exception e) {
            return false;
        }
    }

    private String parseMajorMinor(String version) {
        try {
            String[] parts = version.split("\\.");
            if (parts.length >= 2)
                return parts[0] + "." + parts[1];
            return version;
        } catch (Exception e) {
            return version;
        }
    }
}
