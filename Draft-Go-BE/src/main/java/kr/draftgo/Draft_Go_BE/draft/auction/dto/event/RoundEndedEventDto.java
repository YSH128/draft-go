package kr.draftgo.Draft_Go_BE.draft.auction.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * WebSocket 이벤트에서 라운드 종료 정보를 전달하기 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundEndedEventDto {
    private Long teamId;      // 낙찰된 팀 ID (유찰 시 null)
    private Integer price;    // 낙찰가 (유찰 시 null)
    private boolean isSuccessful;  // 낙찰 여부 (true: 낙찰, false: 유찰)

    /**
     * 낙찰된 경우 생성
     */
    public static RoundEndedEventDto successful(Long teamId, int price) {
        return RoundEndedEventDto.builder()
                .teamId(teamId)
                .price(price)
                .isSuccessful(true)
                .build();
    }

    /**
     * 유찰된 경우 생성
     */
    public static RoundEndedEventDto skipped() {
        return RoundEndedEventDto.builder()
                .teamId(null)
                .price(null)
                .isSuccessful(false)
                .build();
    }
}
