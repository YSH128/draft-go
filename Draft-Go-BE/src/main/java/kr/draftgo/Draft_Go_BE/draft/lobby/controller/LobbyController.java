package kr.draftgo.Draft_Go_BE.draft.lobby.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ChangePositionReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ChangeRoleReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ReadyToggleReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.RefreshCodeReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.SetLeaderPointReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.response.LobbyInfoRes;
import kr.draftgo.Draft_Go_BE.draft.lobby.service.LobbyService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 로비 관리 Controller
 * 로비 정보 조회, 역할/포지션 변경, 준비 완료, 드래프트 시작 등의 API 제공
 */
@Tag(name = "Draft Lobby", description = "드래프트 로비 관리 API")
@RestController
@RequestMapping("/api/v1/drafts/{draftId}/lobby")
@RequiredArgsConstructor
public class LobbyController {

    private final LobbyService lobbyService;

    @Operation(summary = "로비 정보 조회", description = "드래프트 로비의 현재 상태와 참여자 정보를 조회합니다. 관리자만 초대 코드를 조회할 수 있습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로비 정보 조회 성공"),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public LobbyInfoRes getLobbyInfo(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @CurrentMember Member member) {
        return lobbyService.getLobbyInfo(draftId, member.getId());
    }

    @Operation(summary = "역할 변경 (관리자 전용)", description = "참여자의 역할을 팀장(LEADER) 또는 팀원(MEMBER)으로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "역할 변경 성공"),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 역할을 변경할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다 / PARTICIPANT_NOT_FOUND - 참가자를 찾을 수 없습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/change-role")
    @PreAuthorize("isAuthenticated()")
    public void changeRole(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @RequestBody ChangeRoleReq req,
            @CurrentMember Member member) {
        lobbyService.changeRole(draftId, req, member.getId());
    }

    @Operation(summary = "포지션 변경", description = "참여자의 포지션을 변경합니다. (TOP, JUNGLE, MID, BOT, SUP, OBSERVER)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "포지션 변경 성공"),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_POSITION_CHANGE - 본인 또는 관리자만 포지션을 변경할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다 / PARTICIPANT_NOT_FOUND - 참가자를 찾을 수 없습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/change-position")
    @PreAuthorize("isAuthenticated()")
    public void changePosition(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @RequestBody ChangePositionReq req,
            @CurrentMember Member member) {
        lobbyService.changePosition(draftId, req, member.getId());
    }

    @Operation(summary = "참가자 퇴장", description = "자기 자신이 드래프트 방을 나가거나, 관리자가 특정 참가자를 강제로 퇴장시킵니다. (로비 상태에서만 가능)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "참가자 퇴장 성공", content = @Content()),
            @ApiResponse(responseCode = "400", description = "DRAFT_NOT_IN_LOBBY - 로비 상태에서만 퇴장할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 다른 참가자를 퇴장시킬 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/kick/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void kickUser(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @Parameter(description = "퇴장시킬 사용자 ID") @PathVariable Long userId,
            @CurrentMember Member member) {
        lobbyService.kickUser(draftId, userId, member.getId());
    }

    @Operation(summary = "팀장 포인트 설정 (관리자 전용)", description = "팀장의 시작 포인트를 임의로 설정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "팀장 포인트 설정 성공"),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 팀장 포인트를 설정할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다 / PARTICIPANT_NOT_FOUND - 참가자를 찾을 수 없습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/leader-point")
    @PreAuthorize("isAuthenticated()")
    public void setLeaderPoint(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @RequestBody SetLeaderPointReq req,
            @CurrentMember Member member) {
        lobbyService.setLeaderPoint(draftId, req.getLeaderId(), req.getPoint(), member.getId());
    }

    @Operation(summary = "초대 코드 리프레시 (관리자 전용)", description = "팀장 또는 팀원 초대 코드를 새로 생성합니다. codeType: LEADER(팀장) 또는 MEMBER(팀원)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "초대 코드 리프레시 성공", content = @Content()),
            @ApiResponse(responseCode = "400", description = "INVALID_CODE_TYPE - 잘못된 코드 타입입니다 (LEADER 또는 MEMBER만 가능)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 초대 코드를 리프레시할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/refresh-code")
    @PreAuthorize("isAuthenticated()")
    public void refreshInviteCode(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @RequestBody RefreshCodeReq req,
            @CurrentMember Member member) {
        lobbyService.refreshInviteCode(draftId, req.getCodeType(), member.getId());
    }

    @Operation(summary = "준비 완료 토글 (팀장 전용)", description = "팀장이 준비 완료 상태를 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "준비 상태 변경 성공", content = @Content()),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_LEADER_ONLY - 팀장만 준비 완료 상태를 변경할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다 / PARTICIPANT_NOT_FOUND - 드래프트에 참여하지 않은 사용자입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/ready")
    @PreAuthorize("isAuthenticated()")
    public void toggleReady(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @RequestBody ReadyToggleReq req,
            @CurrentMember Member member) {
        lobbyService.toggleReady(draftId, req, member.getId());
    }

    @Operation(summary = "드래프트 시작 (관리자 전용)", description = "모든 팀장이 준비 완료 상태일 때 드래프트를 시작합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "드래프트 시작 성공", content = @Content()),
            @ApiResponse(responseCode = "400", description = """
                    NO_LEADERS - 팀장이 없습니다
                    
                    LEADERS_NOT_READY - 모든 팀장이 준비 완료 상태여야 합니다
                    
                    NO_PLAYING_PARTICIPANTS - 드래프트에 참여하는 플레이어가 없습니다
                    
                    POSITION_MISSING - 필수 포지션 참가자가 없습니다 (예: 탑 포지션 참가자가 없습니다)
                    
                    POSITION_UNBALANCED - 포지션별 참가자 수가 균일하지 않습니다 (예: 탑: 3명, 정글: 2명, 미드: 2명, 바텀: 2명, 서포터: 2명)
                    """,
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "UNAUTHORIZED_ADMIN_ONLY - 관리자만 드래프트를 시작할 수 있습니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public void startDraft(
            @Parameter(description = "드래프트 ID") @PathVariable Long draftId,
            @CurrentMember Member member) {
        lobbyService.startDraft(draftId, member.getId());
    }
}
