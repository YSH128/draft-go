package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Tag(name = "Match", description = "전적 관리 및 갱신 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @Operation(summary = "회원 매치 히스토리 조회", description = "특정 회원의 전적 리스트를 조회합니다. (페이징 지원)")
    @GetMapping("/history/{memberId}")
    public ResponseEntity<List<kr.draftgo.Draft_Go_BE.match.dto.MatchRes>> getMatchHistory(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Pageable (Sort by gameCreation desc)
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("gameCreation").descending());

        List<kr.draftgo.Draft_Go_BE.match.dto.MatchRes> history = matchService.getMatchHistory(memberId, pageable);
        return ResponseEntity.ok(history);
    }
}
