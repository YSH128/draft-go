package kr.draftgo.Draft_Go_BE.match.controller;

import kr.draftgo.Draft_Go_BE.match.dto.MatchRes;
import kr.draftgo.Draft_Go_BE.match.service.MatchService;
import kr.draftgo.Draft_Go_BE.member.dto.MemberRefreshStatusRes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Match", description = "전적 관리 및 갱신 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @Operation(summary = "회원 매치 히스토리 조회", description = "특정 회원의 전적 리스트를 조회합니다. (페이징 지원)")
    @GetMapping("/history/{memberId}")
    public ResponseEntity<List<MatchRes>> getMatchHistory(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Pageable (Sort by gameCreation desc)
        Pageable pageable = PageRequest.of(page, size, Sort.by("gameCreation").descending());

        List<MatchRes> history = matchService.getMatchHistory(memberId, pageable);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "전적 갱신", description = "특정 회원의 전적을 수동으로 갱신합니다. (누구나 가능)")
    @PostMapping("/{memberId}/refresh")
    public ResponseEntity<String> refreshMemberData(@PathVariable Long memberId) {
        String result = matchService.refreshMemberData(memberId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "전적 갱신 상태 확인", description = "전적 갱신 진행 여부와 남은 쿨타임을 확인합니다.")
    @GetMapping("/{username}/status")
    public ResponseEntity<MemberRefreshStatusRes> getRefreshStatus(@PathVariable String username) {
        MemberRefreshStatusRes response = matchService.getRefreshStatus(username);
        return ResponseEntity.ok(response);
    }
}
