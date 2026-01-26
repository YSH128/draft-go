package kr.draftgo.Draft_Go_BE.draft.auction.controller;

import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.DraftMemberResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeamInfoResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.service.AuctionService;
import kr.draftgo.Draft_Go_BE.draft.auction.service.BidService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

@RestController
@RequestMapping("/api/v1/auctions/{draftId}")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final BidService bidService;

    /**
     * 경매 수동 시작/재개 (관리자 전용)
     * - 일반적으로는 LobbyService.startDraft()에서 자동으로 호출됩니다.
     * - 이 엔드포인트는 경매가 중단되거나 에러가 발생했을 때 수동으로 재개하기 위한 용도입니다.
     */
    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public void startAuction(
            @PathVariable Long draftId,
            @CurrentMember Member member) {
        auctionService.processNextRoundByOwner(draftId, member);
    }

    @PostMapping("/bid")
    public void bid(
            @PathVariable Long draftId,
            @RequestBody BidRequest request,
            @AuthUser Long leaderId) {
        bidService.placeBid(draftId, leaderId, request);
    }

    @GetMapping
    public AuctionStatusResponse getState(@PathVariable Long draftId) {
        return auctionService.getCurrentState(draftId);
    }

    @GetMapping("/queue")
    public List<DraftMemberResponse> getDraftQueue(
            @PathVariable Long draftId) {
        return auctionService.getDraftQueue(draftId);
    }

    @GetMapping("/teams")
    public List<TeamInfoResponse> getTeamInfos(
            @PathVariable Long draftId) {
        return auctionService.getTeamInfos(draftId);
    }

    @MessageMapping("/auction/{draftId}/queue")
    @SendTo("/topic/auction/{draftId}/queue")
    public List<DraftMemberResponse> getDraftQueuews(@DestinationVariable Long draftId) {
        return auctionService.getDraftQueue(draftId);
    }

    @MessageMapping("/auction/{draftId}/teams")
    @SendTo("/topic/auction/{draftId}/teams")
    public List<TeamInfoResponse> getTeamInfosWs(@DestinationVariable Long draftId) {
        return auctionService.getTeamInfos(draftId);
    }
}
