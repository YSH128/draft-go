package kr.draftgo.Draft_Go_BE.member.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin", description = "관리자 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final SeasonRepository seasonRepository;

    @Operation(summary = "시즌 생성", description = "새로운 시즌 정보를 생성합니다.")
    @PostMapping("/season")
    public SeasonDocument createSeason(@RequestBody SeasonDocument season) {
        // If marking as active, safely could set others to inactive if needed (manual
        // logic for now)
        return seasonRepository.save(season);
    }
}
