package kr.draftgo.Draft_Go_BE.match.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Builder
@Document(collection = "season_meta")
@NoArgsConstructor
@AllArgsConstructor
public class SeasonDocument {
    @Id
    private String seasonId; // e.g. "S2026"
    private long startTime; // Epoch Second
    @JsonProperty("active")
    private boolean isActive;
}
