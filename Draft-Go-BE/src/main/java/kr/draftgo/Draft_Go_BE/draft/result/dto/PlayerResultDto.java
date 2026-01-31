package kr.draftgo.Draft_Go_BE.draft.result.dto;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.Builder;
import lombok.Getter;

/**
 * 선수별 경매 결과 DTO
 */
@Getter
@Builder
public class PlayerResultDto {
    private Long memberId;
    private String gameName;
    private String tagLine;
    private String profileIconUrl;
    private Position position;
    private Boolean isLeader;           // 팀장 여부
    private Integer bidPrice;           // 낙찰가 (팀장은 startPrice)
    private Tier tier;
    private Division division;

    public static PlayerResultDto from(Teammate teammate, String profileIconUrl, Integer startPrice, MemberStat memberStat) {
        // 팀장인 경우 startPrice를, 아닌 경우 실제 입찰가 사용
        Integer bidPrice = teammate.getIsLeader() ? startPrice : teammate.getPoint();

        return PlayerResultDto.builder()
                .memberId(teammate.getMember().getId())
                .gameName(teammate.getMember().getGameName())
                .tagLine(teammate.getMember().getTagLine())
                .profileIconUrl(profileIconUrl)
                .position(teammate.getPosition())
                .isLeader(teammate.getIsLeader())
                .bidPrice(bidPrice)
                .tier(memberStat != null ? memberStat.getTier() : null)
                .division(memberStat != null ? memberStat.getDivision() : null)
                .build();
    }
}
