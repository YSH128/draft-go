package kr.draftgo.Draft_Go_BE.member.service;

import jakarta.annotation.PostConstruct;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeasonService {

    private final SeasonRepository seasonRepository;

    // 메모리 캐시 (Memory Cache)
    // DB 조회를 최소화하기 위해 시즌 정보를 메모리에 보관합니다.
    private final Map<String, SeasonDocument> seasonCache = new ConcurrentHashMap<>();

    // 현재 활성화된 시즌 (Active Season)
    private volatile SeasonDocument activeSeason;

    @PostConstruct
    public void init() {
        refreshCache();
    }

    /**
     * MongoDB에 저장된 모든 시즌 정보를 메모리(RAM)로 불러옵니다.
     * 서버가 시작될 때(@PostConstruct)와 시즌 정보가 변경되었을 때 실행됩니다.
     */
    public void refreshCache() {
        log.info("Refreshing Season Cache from MongoDB...");
        seasonCache.clear();
        seasonRepository.findAll().forEach(season -> {
            seasonCache.put(season.getSeasonId(), season);
            if (season.isActive()) {
                activeSeason = season;
            }
        });

        // 메모리에 Active로 표시된 시즌이 여러 개일 경우 (DB 데이터 불일치 대비),
        // 시작 시간이 가장 늦은(최신) 시즌 하나만 activeSeason으로 인정하여 안전성을 확보합니다.
        if (activeSeason == null && !seasonCache.isEmpty()) {
            activeSeason = seasonCache.values().stream()
                    .max(Comparator.comparing(SeasonDocument::getStartTime))
                    .orElse(null);
        }

        log.info("시즌 캐시 초기화 완료. 총 시즌 수: {}, 현재 활성화된 시즌: {}", seasonCache.size(),
                activeSeason != null ? activeSeason.getSeasonId() : "없음");
    }

    /**
     * 모든 시즌 목록 조회
     *
     * @return 모든 시즌 목록 (최신순)
     */
    public List<SeasonDocument> getAllSeasons() {
        return seasonCache.values().stream()
                .sorted(Comparator.comparing(SeasonDocument::getStartTime).reversed())
                .collect(Collectors.toList());
    }

    public Optional<SeasonDocument> getSeasonById(String seasonId) {
        return Optional.ofNullable(seasonCache.get(seasonId));
    }

    /**
     * [Strict Mode] 통계 집계용 시즌 조회
     */
    public SeasonDocument getSeasonForStats(String gameVersion) {
        SeasonDocument tentativeSeason = getOrCreateSeasonByVersion(gameVersion); // 기존 로직(Fallback 포함)으로 일단 후보 찾기

        // 후보 시즌이 없거나 UNKNOWN이면 불가
        if (tentativeSeason == null || "UNKNOWN".equals(tentativeSeason.getSeasonId())) {
            return null;
        }

        return tentativeSeason;
    }

    /**
     * 게임 버전을 기반으로 해당 게임이 속한 시즌 정보를 가져옵니다.
     */
    public SeasonDocument getOrCreateSeasonByVersion(String gameVersion) {
        String seasonId = resolveSeasonId(gameVersion);

        if (seasonCache.containsKey(seasonId)) {
            return seasonCache.get(seasonId);
        }

        return null;
    }

    /**
     * 게임 버전을 시즌 ID로 변환하는 핵심 로직
     */
    private String resolveSeasonId(String gameVersion) {
        Optional<SeasonDocument> matchedRule = seasonCache.values().stream()
                .filter(s -> s.getStartVersion() != null && !s.getStartVersion().isEmpty())
                .filter(s -> compareVersions(gameVersion, s.getStartVersion()) >= 0) // 게임버전 >= 시작버전
                .max((s1, s2) -> compareVersions(s1.getStartVersion(), s2.getStartVersion())); // 시작버전이 가장 높은 것 선택

        if (matchedRule.isPresent()) {
            return matchedRule.get().getSeasonId();
        }

        // DB에 규칙이 없다면 코드 기반 기본 로직(Fallback) 사용
        return generateSeasonIdFallback(gameVersion);
    }

    private String generateSeasonIdFallback(String gameVersion) {
        try {
            String[] parts = gameVersion.split("\\.");
            int major = Integer.parseInt(parts[0]);
            int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;

            return String.format("%d%02d", major, minor);

        } catch (Exception e) {
            // 파싱 실패 시 현재 활성화된 시즌으로 퉁치거나 UNKNOWN 처리
            return activeSeason != null ? activeSeason.getSeasonId() : "UNKNOWN";
        }
    }

    // "14.23.1" -> "14.23" (메이저.마이너만 추출)
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

    // 버전 비교 유틸리티 (v1 > v2 이면 양수 반환)
    public int compareVersions(String v1, String v2) {
        String[] parts1 = v1.split("\\.");
        String[] parts2 = v2.split("\\.");
        int len = Math.max(parts1.length, parts2.length);

        for (int i = 0; i < len; i++) {
            int n1 = i < parts1.length ? Integer.parseInt(parts1[i]) : 0;
            int n2 = i < parts2.length ? Integer.parseInt(parts2[i]) : 0;
            if (n1 != n2)
                return n1 - n2;
        }
        return 0;
    }

    public SeasonDocument getActiveSeason() {
        return activeSeason;
    }

    /**
     * [Automation] Bootstrap: DB가 비어있을 때 최초 시즌 생성
     */
    public void createBootstrapSeason(String currentVersion) {
        if (seasonRepository.count() > 0) {
            log.warn("Bootstrap Cancelled: DB is not empty.");
            return;
        }

        // 예: 16.1.1 -> 1601
        String seasonId = generateSeasonIdFallback(currentVersion);
        String startVersion = parseMajorMinor(currentVersion); // 16.1

        SeasonDocument newSeason = SeasonDocument.builder()
                .seasonId(seasonId)
                .seasonName("Season " + seasonId + " (Auto)")
                // [Fix] Bootstrap 시 시작 시간을 현재가 아닌 과거로 설정하여,
                // 해당 시즌의 기존 기록들을 놓치지 않고 긁어오도록 함.
                .startTime(LocalDateTime.now().minusMonths(1))
                .startVersion(startVersion)
                .lastCheckedVersion(startVersion) // 초기화 시점에 이미 확인한 것으로 간주
                .isActive(true)
                .build();

        seasonRepository.save(newSeason);
        refreshCache();
        log.info("[Automation] Bootstrap Season Created: {}", newSeason);
    }

    /**
     * [Automation] Auto-Reset: 챌린저 초기화 감지 시 새 시즌 생성
     */
    public void createNextSeason(String currentVersion) {
        // [Strategy Change] ID Increment
        // 이전 Active Season ID (1601) -> +1 -> 1602
        String nextSeasonId;
        if (activeSeason != null) {
            try {
                int prevId = Integer.parseInt(activeSeason.getSeasonId());
                nextSeasonId = String.valueOf(prevId + 1);
            } catch (NumberFormatException e) {
                // Fallback if ID is not numeric
                nextSeasonId = generateSeasonIdFallback(currentVersion);
            }
        } else {
            nextSeasonId = generateSeasonIdFallback(currentVersion);
        }

        String startVersion = parseMajorMinor(currentVersion);

        // 이미 존재하는지 확인
        if (seasonCache.containsKey(nextSeasonId)) {
            log.info("[Automation] Next Season {} already exists. Skipping creation.", nextSeasonId);
            return;
        }

        // 기존 Active 종료
        if (activeSeason != null) {
            activeSeason.setActive(false);
            seasonRepository.save(activeSeason);
        }

        SeasonDocument newSeason = SeasonDocument.builder()
                .seasonId(nextSeasonId)
                .seasonName("Season " + nextSeasonId + " (Auto)")
                // [Fix] 새 시즌 생성 시 시작 시간을 과거(1달 전)로 설정 (Safe Buffer)
                // 이유: 이 시즌의 첫 매치가 생성 시점보다 이전에 플레이되었을 수 있음.
                .startTime(LocalDateTime.now().minusMonths(1))
                .startVersion(startVersion)
                .lastCheckedVersion(startVersion) // 초기화 시점에 이미 확인한 것으로 간주
                .isActive(true) // 즉시 활성화
                .build();

        seasonRepository.save(newSeason);
        refreshCache();
        log.info("[Automation] Auto-Reset: New Season Created: {}", newSeason);
    }

    /**
     * 시즌의 마지막 확인 버전을 업데이트합니다.
     * 스케줄러가 중복 체크를 방지하기 위해 사용합니다.
     */
    public void updateLastCheckedVersion(String seasonId, String version) {
        SeasonDocument season = seasonCache.get(seasonId);
        if (season != null) {
            season.setLastCheckedVersion(version);
            seasonRepository.save(season);
            refreshCache();
            log.debug("[SeasonService] Updated lastCheckedVersion of {} to {}", seasonId, version);
        }
    }
}
