package kr.draftgo.Draft_Go_BE.draft.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.room.dto.DraftListRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.UpdateDraftInfoReq;
import kr.draftgo.Draft_Go_BE.draft.room.service.DraftListService;
import kr.draftgo.Draft_Go_BE.draft.room.service.DraftManageService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 드래프트 CRUD Controller
 * 드래프트 생성, 조회, 수정, 삭제 기능을 담당합니다.
 */
@Tag(name = "Draft Management", description = "드래프트 생성, 조회, 수정 API")
@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class DraftController {
    private final DraftManageService draftManageService;
    private final DraftListService draftListService;

    /**
     * 드래프트 목록 조회
     */
    @Operation(summary = "드래프트 목록 조회",
               description = "드래프트 방 목록을 조회합니다. 상태 필터링 및 내가 참여한 대회 필터링을 지원합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "MISSING_TOKEN - 내가 참여한 대회를 조회하려면 로그인이 필요합니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public List<DraftListRes> getDraftList(
            @Parameter(description = "상태 필터 (ALL, LOBBY, IN_DRAFT, COMPLETED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "내가 참여한 대회만 조회 (true/false)")
            @RequestParam(name = "my_participation", required = false, defaultValue = "false") Boolean myParticipation,
            @CurrentMember Member member) {

        // status가 "ALL"이면 null로 처리 (전체 조회)
        DraftStatus draftStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            try {
                draftStatus = DraftStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 잘못된 status는 무시하고 전체 조회
            }
        }

        // memberId 추출 (비로그인 시 null)
        Long memberId = member != null ? member.getId() : null;

        // 내가 참여한 대회만 필터링
        if (myParticipation) {
            // 비로그인 사용자가 내 참여 목록을 요청한 경우
            // Spring Security의 표준 예외를 발생시켜 JwtAuthenticationEntryPoint에서 처리
            if (member == null) {
                throw new InsufficientAuthenticationException("내가 참여한 대회를 조회하려면 로그인이 필요합니다.");
            }

            if (draftStatus != null) {
                return draftListService.getDraftListByStatusAndMemberId(draftStatus, memberId);
            } else {
                return draftListService.getDraftListByMemberId(memberId);
            }
        }

        // 상태별 필터링
        if (draftStatus != null) {
            return draftListService.getDraftListByStatus(draftStatus, memberId);
        }

        // 필터링 없이 전체 조회
        return draftListService.getDraftList(memberId);
    }

    /**
     * 드래프트 방 생성
     */
    @Operation(summary = "드래프트 방 생성",
               description = "새로운 드래프트 방을 생성하고 참여 코드를 발급받습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "DRAFT_START_PRICE_INVALID - 시작 가격은 시작 포인트보다 작거나 같아야 합니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public RoomCreateRes createDraft(
            @CurrentMember Member member,
            @Valid @RequestBody RoomCreateReq req) {
        return draftManageService.createRoom(req, member);
    }

    /**
     * 드래프트 정보 수정 (관리자 전용)
     */
    @Operation(summary = "드래프트 정보 수정 (관리자 전용)",
               description = "드래프트 제목, 시작 가격, 시작 포인트, 최대 팀 수, 썸네일 URL을 수정합니다. 로비 상태에서만 가능하며, 변경사항은 로비의 모든 참가자에게 실시간으로 알림됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "드래프트 정보 수정 성공", content = @Content()),
            @ApiResponse(responseCode = "400", description = """
                    DRAFT_NOT_IN_LOBBY - 로비 상태에서만 정보를 수정할 수 있습니다
                    
                    DRAFT_START_PRICE_INVALID - 시작 가격은 시작 포인트보다 작거나 같아야 합니다
                    
                    VALIDATION_ERROR - 요청 데이터 검증 실패 (필수 필드 누락, 형식 오류 등)
                    """,
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "MISSING_TOKEN - 인증이 필요합니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 드래프트 정보를 수정할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{draftId}")
    @PreAuthorize("isAuthenticated()")
    public void updateDraftInfo(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @Valid @RequestBody UpdateDraftInfoReq req,
            @CurrentMember Member member) {
        draftManageService.updateDraftInfo(draftId, req, member.getId());
    }
}
