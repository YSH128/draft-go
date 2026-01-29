package kr.draftgo.Draft_Go_BE.draft.auction.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

@Tag(name = "Draft Auction", description = "Draft auction API")
@RestController
@RequestMapping("/api/v1/auctions/{draftId}")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;
    private final BidService bidService;
    @Operation(summary = "Start auction manually")
    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public void startAuction(@PathVariable Long draftId, @CurrentMember Member member) {
        auctionService.processNextRoundByOwner(draftId, member);
    }
    @Operation(summary = "Place a bid")
    @PostMapping("/bid")
    public void bid(@PathVariable Long draftId, @Valid @RequestBody BidRequest request,
                    @CurrentMember Member member) {
        bidService.placeBid(draftId, member, request);
    }
    @Operation(summary = "Get auction state")
    @GetMapping
    public AuctionStatusResponse getState(@PathVariable Long draftId) {
        return auctionService.getCurrentState(draftId);
    }
    @Operation(summary = "Get draft queue")
    @GetMapping("/queue")
    public List<DraftMemberResponse> getDraftQueue(@PathVariable Long draftId) {
        return auctionService.getDraftQueue(draftId);
    }
    @Operation(summary = "Get team infos")
    @GetMapping("/teams")
    public List<TeamInfoResponse> getTeamInfos(@PathVariable Long draftId) {
        return auctionService.getTeamInfos(draftId);
    }
    @MessageMapping("/auction/{draftId}/queue")
    @SendTo("/topic/auction/{draftId}/queue")
    public List<DraftMemberResponse> getDraftQueueWs(@DestinationVariable Long draftId) {
        return auctionService.getDraftQueue(draftId);
    }
    @MessageMapping("/auction/{draftId}/teams")
    @SendTo("/topic/auction/{draftId}/teams")
    public List<TeamInfoResponse> getTeamInfosWs(@DestinationVariable Long draftId) {
        return auctionService.getTeamInfos(draftId);
    }
}