package kr.draftgo.Draft_Go_BE.match.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.core.ParameterizedTypeReference;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DataDragonService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Getter
    private String version = "latest"; // Default

    private final Map<Integer, String> runeIconMap = new HashMap<>();
    private final Map<String, String> spellImageMap = new HashMap<>(); // Key (e.g. "4") -> ImageFile (e.g.
                                                                       // "SummonerFlash.png")
    private final Map<String, String> championNameMap = new HashMap<>(); // 영어 -> 한글 챔피언 이름 매핑 (e.g. "MissFortune" ->
                                                                         // "미스 포츈")

    private static final String VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
    private static final String RUNES_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/%s/data/ko_KR/runesReforged.json";
    private static final String SPELL_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/%s/data/ko_KR/summoner.json";
    private static final String CHAMPION_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/%s/data/ko_KR/champion.json";

    public DataDragonService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    @PostConstruct
    public void init() {
        try {
            // 1. Fetch Latest Version
            List<String> versions = restClient.get()
                    .uri(VERSION_URL)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<String>>() {
                    });

            if (versions != null && !versions.isEmpty()) {
                this.version = versions.get(0);
                log.info("✅ [DataDragon] 패치 버전 초기화: {}", this.version);
            }

            // 2. Fetch & Cache Runes
            fetchRunes();

            // 3. Fetch & Cache Spells
            fetchSpells();

            // 4. Fetch & Cache Champions (Korean Names)
            fetchChampions();

        } catch (Exception e) {
            log.error("❌ [DataDragon] 초기화 실패", e);
        }
    }

    private void fetchRunes() {
        try {
            String url = String.format(RUNES_URL_TEMPLATE, this.version);
            String jsonResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(jsonResponse);

            if (root.isArray()) {
                for (JsonNode style : root) {
                    // Main Style (e.g. Domination)
                    int styleId = style.get("id").asInt();
                    runeIconMap.put(styleId, style.get("icon").asText());

                    // Slots -> Runes
                    JsonNode slots = style.get("slots");
                    if (slots != null) {
                        for (JsonNode slot : slots) {
                            JsonNode runes = slot.get("runes");
                            if (runes != null) {
                                for (JsonNode rune : runes) {
                                    runeIconMap.put(rune.get("id").asInt(), rune.get("icon").asText());
                                }
                            }
                        }
                    }
                }
            }
            log.info("Cached {} Runes", runeIconMap.size());
        } catch (Exception e) {
            log.error("Failed to fetch Runes", e);
        }
    }

    private void fetchSpells() {
        try {
            String url = String.format(SPELL_URL_TEMPLATE, this.version);
            String jsonResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode data = root.get("data");

            if (data != null) {
                data.fields().forEachRemaining(entry -> {
                    JsonNode spell = entry.getValue();
                    String key = spell.get("key").asText(); // e.g. "4"
                    String imageFull = spell.get("image").get("full").asText(); // e.g. "SummonerFlash.png"
                    spellImageMap.put(key, imageFull);
                });
            }
            log.info("Cached {} Spells", spellImageMap.size());
        } catch (Exception e) {
            log.error("Failed to fetch Spells", e);
        }
    }

    private void fetchChampions() {
        try {
            String url = String.format(CHAMPION_URL_TEMPLATE, this.version);
            String jsonResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode data = root.get("data");

            if (data != null) {
                data.fields().forEachRemaining(entry -> {
                    String englishName = entry.getKey(); // 영어 이름 (e.g. "MissFortune")
                    JsonNode champion = entry.getValue();
                    String koreanName = champion.get("name").asText(); // 한글 이름 (e.g. "미스 포츈")
                    championNameMap.put(englishName, koreanName);
                });
            }
            log.info("Cached {} Champions (Korean Names)", championNameMap.size());
        } catch (Exception e) {
            log.error("❌ [DataDragon] 챔피언 데이터 로드 실패", e);
        }
    }

    /**
     * 패치 버전만 갱신 (스케줄러에서 먼저 호출)
     * 
     * @return 버전이 변경되었으면 true, 아니면 false
     */
    public boolean refreshVersion() {
        try {
            List<String> versions = restClient.get()
                    .uri(VERSION_URL)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<String>>() {
                    });

            if (versions == null || versions.isEmpty()) {
                log.warn("⚠️ [DataDragon] 버전 정보를 가져올 수 없습니다.");
                return false;
            }

            String latestVersion = versions.get(0);

            if (latestVersion.equals(this.version)) {
                log.info("ℹ️ [DataDragon] 패치 버전 변경 없음: {}", this.version);
                return false;
            }

            String oldVersion = this.version;
            this.version = latestVersion;
            log.info("🔄 [DataDragon] 패치 버전 업데이트: {} -> {}", oldVersion, latestVersion);
            return true;

        } catch (Exception e) {
            log.error("❌ [DataDragon] 버전 갱신 실패", e);
            return false;
        }
    }

    /**
     * 모든 데이터 갱신 (오직 버전이 변경되었을 때만)
     * refreshVersion()이 true를 반환한 후에만 호출하세요.
     */
    public void refreshAllDataIfNeeded() {
        try {
            // 챔피언 데이터 재로드
            championNameMap.clear();
            fetchChampions();

            // 룬/스펠도 갱신
            runeIconMap.clear();
            fetchRunes();

            spellImageMap.clear();
            fetchSpells();

            log.info("✅ [DataDragon] 모든 데이터 갱신 완료: {}", this.version);

        } catch (Exception e) {
            log.error("❌ [DataDragon] 데이터 갱신 실패", e);
        }
    }

    /**
     * @deprecated 대신 refreshVersion() + refreshAllDataIfNeeded()를 사용하세요.
     *             챔피언 데이터 갱신 (스케줄러에서 호출)
     *             패치 버전이 변경되었을 때 챔피언 한글 이름 매핑을 갱신합니다.
     */
    @Deprecated
    public void refreshChampionData() {
        // 이전 버전과의 호환성을 위해 유지
        if (refreshVersion()) {
            refreshAllDataIfNeeded();
        }
    }

    // --- Public Methods to get URLs ---

    public String getChampionIconUrl(String championName) {
        if (championName == null || championName.isEmpty())
            return null;
        return String.format("https://ddragon.leagueoflegends.com/cdn/%s/img/champion/%s.png", this.version,
                championName);
    }

    public String getItemIconUrl(int itemId) {
        if (itemId == 0)
            return null; // Empty slot
        return String.format("https://ddragon.leagueoflegends.com/cdn/%s/img/item/%d.png", this.version, itemId);
    }

    public String getRuneIconUrl(int runeId) {
        String iconPath = runeIconMap.get(runeId);
        if (iconPath == null)
            return null;
        return String.format("https://ddragon.leagueoflegends.com/cdn/img/%s", iconPath);
    }

    public String getSpellIconUrl(int spellKey) {
        String imageFile = spellImageMap.get(String.valueOf(spellKey));
        if (imageFile == null)
            return null;
        return String.format("https://ddragon.leagueoflegends.com/cdn/%s/img/spell/%s", this.version, imageFile);
    }

    public String getProfileIconUrl(Integer profileIconId) {
        // null인 경우 기본 프로필 아이콘 (아이콘 ID: 0)
        if (profileIconId == null) {
            profileIconId = 0;
        }
        return String.format("https://ddragon.leagueoflegends.com/cdn/%s/img/profileicon/%d.png", this.version,
                profileIconId);
    }

    /**
     * 영어 챔피언 이름을 한글 이름으로 변환
     * 
     * @param englishName 영어 챔피언 이름 (e.g. "MissFortune")
     * @return 한글 챔피언 이름 (e.g. "미스 포츈"), 매핑이 없으면 영어 이름 그대로 반환
     */
    public String getKoreanChampionName(String englishName) {
        if (englishName == null || englishName.isEmpty()) {
            return englishName;
        }
        return championNameMap.getOrDefault(englishName, englishName);
    }
}
