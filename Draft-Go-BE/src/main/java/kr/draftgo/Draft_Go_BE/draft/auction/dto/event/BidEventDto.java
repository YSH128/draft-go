package kr.draftgo.Draft_Go_BE.draft.auction.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * WebSocket 이벤트에서 입찰 정보를 전달하기 위한 DTO
 * remainingSeconds 필드를 포함합니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidEventDto {
    private Long teamId;
    private int price;
    private Integer remainingSeconds; // 입찰 후 리셋된 타이머의 남은 시간
}
