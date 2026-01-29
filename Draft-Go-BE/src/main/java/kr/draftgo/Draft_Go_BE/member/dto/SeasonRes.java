package kr.draftgo.Draft_Go_BE.member.dto;

import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 시즌 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonRes {
    private String seasonId;
    private String seasonName;
    private String startVersion;
    private String lastCheckedVersion;
    private LocalDateTime startTime;
    private boolean isActive;

    public static SeasonRes from(SeasonDocument season) {
        return SeasonRes.builder()
                .seasonId(season.getSeasonId())
                .seasonName(season.getSeasonName())
                .startVersion(season.getStartVersion())
                .lastCheckedVersion(season.getLastCheckedVersion())
                .startTime(season.getStartTime())
                .isActive(season.isActive())
                .build();
    }
}
