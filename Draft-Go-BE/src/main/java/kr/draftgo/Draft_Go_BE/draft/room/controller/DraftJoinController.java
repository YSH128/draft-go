package kr.draftgo.Draft_Go_BE.draft.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.draft.room.service.DraftJoinService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 드래프트 참가 Controller
 * 드래프트 방 입장 기능을 담당합니다.
 */
@Tag(name = "Draft Join", description = "드래프트 참가 API")
@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class DraftJoinController {
    private final DraftJoinService draftJoinService;

    /**
     * 드래프트 방 참가
     */
    @Operation(summary = "드래프트 방 참가",
               description = """
                       참여 코드를 사용하여 드래프트 방에 입장합니다.

                       팀장 코드로 입장 시 position 필드는 필수이며 OBSERVER는 선택할 수 없습니다.
                       """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "참가 성공, 드래프트 ID 반환"),
            @ApiResponse(responseCode = "400", description = """
                    LEADER_CANNOT_BE_OBSERVER - 팀장은 관전자가 될 수 없습니다. 특정 포지션을 선택해주세요
                    
                    MAX_TEAM_COUNT_EXCEEDED - 최대 팀 수를 초과하여 팀장을 추가할 수 없습니다
                    
                    INVALID_DRAFT_CODE - 유효하지 않은 참여 코드입니다
                    
                    DRAFT_NOT_IN_LOBBY - 로비 상태에서만 참가할 수 있습니다
                    
                    VALIDATION_ERROR - 요청 데이터 검증 실패 (draftCode 또는 draftId 필수)
                    """,
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "MISSING_TOKEN - 인증이 필요합니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 방 ID로 참가는 관리자만 가능합니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "ALREADY_PARTICIPATING - 이미 드래프트에 참여 중입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/join")
    @PreAuthorize("isAuthenticated()")
    public Long joinDraft(
            @Valid @RequestBody RoomJoinReq req,
            @CurrentMember Member member) {
        return draftJoinService.joinRoom(req, member);
    }
}
