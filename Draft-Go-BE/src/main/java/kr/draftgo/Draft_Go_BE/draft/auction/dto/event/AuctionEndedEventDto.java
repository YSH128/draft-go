package kr.draftgo.Draft_Go_BE.draft.auction.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * WebSocket 이벤트에서 경매 완전 종료 정보를 전달하기 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionEndedEventDto {
    private Long draftId;
    private String message;

    /**
     * 경매 종료 이벤트 생성
     */
    public static AuctionEndedEventDto of(Long draftId) {
        return AuctionEndedEventDto.builder()
                .draftId(draftId)
                .message("경매가 완전히 종료되었습니다.")
                .build();
    }
}
