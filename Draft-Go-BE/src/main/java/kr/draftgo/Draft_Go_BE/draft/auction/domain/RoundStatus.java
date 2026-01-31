package kr.draftgo.Draft_Go_BE.draft.auction.domain;

import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.util.List;

import lombok.ToString;

@Getter
@Builder
@ToString
@AllArgsConstructor
public class RoundStatus implements Serializable {
    // 경매 대상이 되는 플레이어 정보, 순번, 입찰 및 낙찰 여부를 포함합니다.
    // 라운드가 종료될 때, currentMemberStatus가 COMPLETED 또는 SKIPPED로 변경됩니다.
    // 라운드가 다시 시작될 때, 새로운 RoundStatus가 생성됩니다.
    // 이 정보는 Redis의 current 키에 저장됩니다.

    private Long draftId;
    private String playerName;
    private String playerProfileImageUrl;
    private Tier tier;
    private Division division;
    private Position position;          // 경매 대상 선수의 포지션
    private Position mainPosition;      // 주 포지션 (선호 포지션)
    private Position subPosition;       // 부 포지션 (선호 포지션)
    private List<String> mostChampions; // 모스트 챔피언 최대 3개
    private Long draftMemberId;
    private int turnOrder;
    private CurrentMemberStatus currentMemberStatus;

    public static RoundStatus start(Long draftId, Long draftMemberId,
                                    int turnOrder,
                                    String playerName,
                                    String playerProfileImageUrl,
                                    Tier tier,
                                    Division division,
                                    Position position,
                                    Position mainPosition,
                                    Position subPosition,
                                    List<String> mostChampions) {
        return RoundStatus.builder()
                .draftId(draftId)
                .currentMemberStatus(CurrentMemberStatus.BIDDING)
                .turnOrder(turnOrder)
                .draftMemberId(draftMemberId)
                .playerName(playerName)
                .tier(tier)
                .division(division)
                .position(position)
                .mainPosition(mainPosition)
                .subPosition(subPosition)
                .mostChampions(mostChampions)
                .playerProfileImageUrl(playerProfileImageUrl)
                .build();
    }
}
