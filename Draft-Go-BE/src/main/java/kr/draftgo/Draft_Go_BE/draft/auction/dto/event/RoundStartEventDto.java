package kr.draftgo.Draft_Go_BE.draft.auction.dto.event;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * WebSocket 이벤트에서 라운드 시작 정보를 전달하기 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundStartEventDto {
    private RoundStatus roundStatus;
}
