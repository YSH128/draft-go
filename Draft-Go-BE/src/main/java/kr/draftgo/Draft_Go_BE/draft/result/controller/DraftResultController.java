package kr.draftgo.Draft_Go_BE.draft.result.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.draftgo.Draft_Go_BE.draft.result.dto.DraftResultResponse;
import kr.draftgo.Draft_Go_BE.draft.result.service.DraftResultService;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 경매 결과 조회 API
 */
@Tag(name = "Draft Result", description = "경매 결과 조회 API")
@RestController
@RequestMapping("/api/v1/drafts/{draftId}/result")
@RequiredArgsConstructor
public class DraftResultController {

    private final DraftResultService draftResultService;

    @Operation(
            summary = "경매 결과 상세 조회",
            description = """
                    완료된 경매의 결과를 상세하게 조회합니다.
                    
                    **제공 정보**:
                    - Draft 기본 정보 (제목, 시작 포인트, 상태 등)
                    - 팀별 정보 (팀명, 최종 포인트, 사용 포인트)
                    - 각 팀원의 정보 (포지션, 낙찰가, 티어 등)
                    
                    **참고**:
                    - 경매가 완료되지 않은 경우에도 조회 가능 (진행 중 결과 확인용)
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "경매 결과 조회 성공",
                    content = @Content(schema = @Schema(implementation = DraftResultResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "DRAFT_NOT_FOUND - 존재하지 않는 드래프트입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<DraftResultResponse> getDraftResult(
            @Parameter(description = "드래프트 ID", required = true)
            @PathVariable Long draftId) {
        DraftResultResponse result = draftResultService.getDraftResult(draftId);
        return ResponseEntity.ok(result);
    }
}
