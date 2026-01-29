package kr.draftgo.Draft_Go_BE.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.draftgo.Draft_Go_BE.draft.auction.service.AuctionRecoveryService;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.dto.SeasonRes;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import kr.draftgo.Draft_Go_BE.member.service.SeasonService;
import kr.draftgo.Draft_Go_BE.member.dto.AddTestMembersRes;
import kr.draftgo.Draft_Go_BE.member.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Tag(name = "Admin", description = "관리자 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final SeasonRepository seasonRepository;
    private final SeasonService seasonService;
    private final AdminService adminService;
    private final AuctionRecoveryService auctionRecoveryService;

    @Operation(summary = "시즌 생성", description = "새로운 시즌 정보를 생성합니다.")
    @PostMapping("/season")
    public SeasonDocument createSeason(@RequestBody SeasonDocument season) {
        // If marking as active, safely could set others to inactive if needed (manual
        // logic for now)
        return seasonRepository.save(season);
    }

    @Operation(summary = "시즌 목록 조회", description = "모든 시즌 정보를 조회합니다. (최신순)")
    @GetMapping("/seasons")
    public List<SeasonRes> getAllSeasons() {
        return seasonService.getAllSeasons().stream()
                .map(SeasonRes::from)
                .collect(Collectors.toList());
    @Operation(summary = "테스트 멤버 로비 입장", description = "특정 드래프트에 test1~test10 멤버를 로비에 입장시킵니다. 이미 참가 중인 멤버는 건너뜁니다.")
    @PostMapping("/drafts/{draftId}/add-test-members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AddTestMembersRes> addTestMembersToLobby(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId) {
        List<String> addedMembers = adminService.addTestMembersToLobby(draftId);

        AddTestMembersRes response = AddTestMembersRes.builder()
                .draftId(draftId)
                .addedCount(addedMembers.size())
                .addedMembers(addedMembers)
                .message(addedMembers.size() + "명의 테스트 멤버가 로비에 추가되었습니다.")
                .build();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "경매 수동 복구", description = "중단된 경매를 수동으로 복구합니다. 서버 다운 등으로 경매가 멈춘 경우 사용합니다.")
    @PostMapping("/drafts/{draftId}/recover-auction")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> recoverAuction(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId) {
        auctionRecoveryService.manualRecovery(draftId);

        return ResponseEntity.ok(Map.of(
            "draftId", draftId.toString(),
            "message", "경매가 복구되었습니다."
        ));
    }
}
