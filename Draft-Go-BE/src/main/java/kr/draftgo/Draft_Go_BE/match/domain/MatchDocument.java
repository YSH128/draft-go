package kr.draftgo.Draft_Go_BE.match.domain;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Getter
@Builder
@Document(collection = "matches")
public class MatchDocument {
    @Id
    private String matchId;

    // Store the entire raw response from Riot API to be flexible
    private Map<String, Object> data;

    // Epoch millis
    private long gameCreation;
    private long gameDuration;
    private String gameMode;
}
