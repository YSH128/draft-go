package kr.draftgo.Draft_Go_BE.draft.auction.controller;

import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.service.AuctionService;
import kr.draftgo.Draft_Go_BE.draft.auction.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auctions/{draftId}")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final BidService bidService;

    @PostMapping("/start")
    public void startAuction(@PathVariable Long draftId) {
        auctionService.startAuction(draftId);
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
}
