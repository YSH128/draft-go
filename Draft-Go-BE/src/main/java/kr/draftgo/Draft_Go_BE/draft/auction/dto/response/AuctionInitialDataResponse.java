package kr.draftgo.Draft_Go_BE.draft.auction.dto.response;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 경매 초기 로드를 위한 통합 응답 DTO
 * 클라이언트가 페이지 진입 시 필요한 모든 정보를 한 번에 제공
 */
@Getter
@Builder
public class AuctionInitialDataResponse {

    // 현재 라운드 정보
    private RoundStatus currentRound;           // 현재 진행 중인 라운드 상태
    private BidInfo currentBid;                 // 현재 최고 입찰가
    private Integer remainingSeconds;           // 남은 시간 (초), 타이머가 없으면 null

    // 대기열 정보
    private List<DraftMemberResponse> queue;    // 드래프트 대기열
    private String nextPlayerName;              // 다음 선수 이름 (대기열 첫 번째)

    // 팀 정보
    private List<TeamInfoResponse> teams;       // 전체 팀 정보 (포인트, 팀원 등)

    public static AuctionInitialDataResponse of(
            RoundStatus currentRound,
            BidInfo currentBid,
            Integer remainingSeconds,
            List<DraftMemberResponse> queue,
            String nextPlayerName,
            List<TeamInfoResponse> teams) {
        return AuctionInitialDataResponse.builder()
                .currentRound(currentRound)
                .currentBid(currentBid)
                .remainingSeconds(remainingSeconds)
                .queue(queue)
                .nextPlayerName(nextPlayerName)
                .teams(teams)
                .build();
    }
}
