package kr.draftgo.Draft_Go_BE.draft.auction.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.BidReq;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.AuctionInitialDataResponse;
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
    public void bid(@PathVariable Long draftId, @Valid @RequestBody BidReq request,
                    @CurrentMember Member member) {
        bidService.placeBid(draftId, member, request);
    }

    @Operation(
            summary = "경매 초기 데이터 조회",
            description = "페이지 진입 시 필요한 모든 정보를 한 번에 제공합니다. " +
                    "현재 라운드, 입찰 정보, 타이머, 대기열, 팀 정보를 포함합니다."
    )
    @GetMapping
    public AuctionInitialDataResponse getInitialData(@PathVariable Long draftId) {
        return auctionService.getInitialData(draftId);
    }

    @Operation(summary = "드래프트 대기열 조회",
            description = "드래프트 대기열 수동 새로고침용")
    @GetMapping("/queue")
    public List<DraftMemberResponse> getDraftQueue(@PathVariable Long draftId) {
        return auctionService.getDraftQueue(draftId);
    }

    @Operation(summary = "드래프트 구성 팀 정보 조회",
            description = "드래프트 구성 팀 정보 수동 새로고침용")
    @GetMapping("/teams")
    public List<TeamInfoResponse> getTeamInfos(@PathVariable Long draftId) {
        return auctionService.getTeamInfos(draftId);
    }
}