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

    private static final String VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
    private static final String RUNES_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/%s/data/ko_KR/runesReforged.json";
    private static final String SPELL_URL_TEMPLATE = "https://ddragon.leagueoflegends.com/cdn/%s/data/ko_KR/summoner.json";

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
                log.info("DataDragon Version Initialized: {}", this.version);
            }

            // 2. Fetch & Cache Runes
            fetchRunes();

            // 3. Fetch & Cache Spells
            fetchSpells();

        } catch (Exception e) {
            log.error("Failed to initialize DataDragonService", e);
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

    public String getProfileIconUrl(int profileIconId) {
        return String.format("https://ddragon.leagueoflegends.com/cdn/%s/img/profileicon/%d.png", this.version,
                profileIconId);
    }
}
