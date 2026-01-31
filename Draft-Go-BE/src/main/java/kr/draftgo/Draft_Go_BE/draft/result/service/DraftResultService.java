package kr.draftgo.Draft_Go_BE.draft.result.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.*;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.draft.result.dto.DraftResultResponse;
import kr.draftgo.Draft_Go_BE.draft.result.dto.PlayerResultDto;
import kr.draftgo.Draft_Go_BE.draft.result.dto.TeamResultDto;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import kr.draftgo.Draft_Go_BE.member.service.MemberStatService;
import kr.draftgo.Draft_Go_BE.member.service.SeasonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 경매 결과 조회 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DraftResultService {

    private final DraftRepository draftRepository;
    private final TeamRepository teamRepository;
    private final TeammateRepository teammateRepository;
    private final MemberStatRepository memberStatRepository;
    private final DataDragonService dataDragonService;
    private final SeasonService seasonService;
    private final MemberStatService memberStatService;

    /**
     * 경매 결과 상세 조회
     *
     * @param draftId 드래프트 ID
     * @return 경매 결과 상세 정보
     */
    @Transactional(readOnly = true)
    public DraftResultResponse getDraftResult(Long draftId) {
        // 1. Draft 조회
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 2. 팀별 결과 조회
        List<Team> teams = teamRepository.findAllByDraftId(draftId);
        List<TeamResultDto> teamResults = teams.stream()
                .map(team -> buildTeamResult(team, draft.getStartPoint(), draft.getStartPrice()))
                .collect(Collectors.toList());

        return DraftResultResponse.from(draft, teamResults);
    }

    /**
     * 팀별 결과 DTO 생성
     */
    private TeamResultDto buildTeamResult(Team team, Integer startPoint, Integer startPrice) {
        // 팀원 조회 (Member fetch join)
        List<Teammate> teammates = teammateRepository.findByTeamIdWithMember(team.getId());

        // 팀원들의 memberId 수집
        List<Long> memberIds = teammates.stream()
                .map(tm -> tm.getMember().getId())
                .distinct()
                .collect(Collectors.toList());

        // MemberStat 일괄 조회 (활성 시즌 기준)
        var memberStatMap = memberStatService.getMemberStatsForCurrentSeason(memberIds);

        // 선수별 결과 DTO 생성
        List<PlayerResultDto> players = teammates.stream()
                .map(teammate -> {
                    String profileIconUrl = dataDragonService.getProfileIconUrl(
                            teammate.getMember().getProfileIconId()
                    );
                    return PlayerResultDto.from(
                            teammate,
                            profileIconUrl,
                            startPrice,
                            memberStatMap.get(teammate.getMember().getId())
                    );
                })
                .collect(Collectors.toList());

        // 사용한 포인트 계산 (시작 포인트 - 최종 포인트)
        Integer spentPoint = startPoint - team.getPoint();

        return TeamResultDto.of(team, spentPoint, players);
    }
}
