package kr.draftgo.Draft_Go_BE.member.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Builder
@Document(collection = "season_meta")
@NoArgsConstructor
@AllArgsConstructor
public class SeasonDocument {
    @Id
    private String seasonId; // 시즌 ID (예: "1401", "1602")

    // 시즌 시작 및 자동 활성화 시간 (이 시간이 되면 스케줄러에 의해 활성화됨)
    // 기존 Unix Timestamp(long)와 openTime(LocalDateTime)을 통합하여 관리
    private LocalDateTime startTime;

    // 이 시즌에 포함될 최소 게임 버전 (예: "14.1" -> 14.1 버전 이상은 이 시즌으로 분류)
    private String startVersion;

    // 마지막으로 확인한 게임 버전 (중복 체크 방지용)
    private String lastCheckedVersion;

    private boolean isActive; // 현재 활성화 여부 (true면 현재 진행 중인 시즌)

    // [Automation Fields]
    private String seasonName;
}
