package kr.draftgo.Draft_Go_BE.draft.controller;

import kr.draftgo.Draft_Go_BE.draft.dto.DraftDto;
import kr.draftgo.Draft_Go_BE.draft.service.DraftService;
import kr.draftgo.Draft_Go_BE.global.auth.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
public class DraftController {

    private final DraftService draftService;

    @PostMapping
    public DraftDto.DraftCreateRes createDraft(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody DraftDto.DraftCreateReq req) {
        return draftService.createDraft(req, user.getMember());
    }

    @PostMapping("/join")
    public Long joinDraftByCode(
            @RequestBody DraftDto.JoinDraftReq req,
            @AuthenticationPrincipal CustomUserDetails user) {
        return draftService.joinDraft(req, user.getMember().getId());
    }
}
