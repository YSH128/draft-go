package kr.draftgo.Draft_Go_BE.draft.room.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.draft.room.service.RoomService;
import kr.draftgo.Draft_Go_BE.global.auth.CurrentMember;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 드래프트 방 생성 및 참가 Controller
 */
@Tag(name = "Draft Room", description = "드래프트 방 생성 및 참가 API")
@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

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
}
