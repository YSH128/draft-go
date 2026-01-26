package kr.draftgo.Draft_Go_BE.draft.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.draft.room.dto.DraftListRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.UpdateDraftInfoReq;
import kr.draftgo.Draft_Go_BE.draft.room.service.RoomService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 드래프트 방 생성 및 참가 Controller
 */
@Tag(name = "Draft Room", description = "드래프트 방 생성 및 참가 API")
@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @Operation(summary = "드래프트 목록 조회", description = "모든 드래프트 방 목록을 조회합니다.")
    @GetMapping
    public List<DraftListRes> getDraftList() {
        return roomService.getDraftList();
    }

    @Operation(summary = "드래프트 방 생성", description = "새로운 드래프트 방을 생성하고 참여 코드를 발급받습니다.")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public RoomCreateRes createRoom(
            @CurrentMember Member member,
            @RequestBody RoomCreateReq req) {
        return roomService.createRoom(req, member);
    }

    @Operation(summary = "드래프트 방 참가", description = "참여 코드를 사용하여 드래프트 방에 입장합니다.")
    @PostMapping("/join")
    @PreAuthorize("isAuthenticated()")
    public Long joinRoom(
            @RequestBody RoomJoinReq req,
            @CurrentMember Member member) {
        return roomService.joinRoom(req, member.getId());
    }

    @Operation(summary = "드래프트 정보 수정 (관리자 전용)", description = "드래프트 제목, 시작 가격, 시작 포인트, 최대 팀 수를 수정합니다. (로비 상태에서만 가능)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "드래프트 정보 수정 성공", content = @Content()),
            @ApiResponse(responseCode = "400", description = """
                    DRAFT_NOT_IN_LOBBY - 로비 상태에서만 정보를 수정할 수 있습니다
                    
                    DRAFT_START_PRICE_INVALID - 시작 가격은 시작 포인트보다 작거나 같아야 합니다
                    """,
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
        roomService.updateDraftInfo(draftId, req, member.getId());
    }
}
