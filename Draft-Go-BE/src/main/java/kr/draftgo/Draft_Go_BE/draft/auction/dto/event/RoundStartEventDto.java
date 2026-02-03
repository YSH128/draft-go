package kr.draftgo.Draft_Go_BE.draft.auction.dto.event;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.CurrentMemberStatus;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * WebSocket 이벤트에서 라운드 시작 정보를 전달하기 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundStartEventDto {
    private Long draftId;
    private Long draftMemberId;
    private String playerName;
    private String playerProfileImageUrl;
    private Tier tier;
    private Division division;
    private Position position; // 경매 포지션
    private Position mainPosition; // 주 포지션
    private Position subPosition; // 부 포지션
    private List<MostChampionRes> mostChampions; // 모스트 챔피언 (최대 3개, championIconUrl 포함)
    private int turnOrder;
    private CurrentMemberStatus currentMemberStatus;
}
