package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.AuctionInitialDataResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.DraftMemberResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeamInfoResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeammateResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.service.MemberStatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionQueryService {

    private final RedisAuctionRepository redisRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final TeamRepository teamRepo;
    private final TeammateRepository teammateRepo;
    private final DataDragonService dataDragonService;
    private final MemberStatService memberStatService;

    @Transactional
    public AuctionInitialDataResponse getInitialData(Long draftId) {
        // 1. 현재 라운드 정보
        RoundStatus currentRound = redisRepo.getCurrent(draftId);

        // 2. 현재 입찰 정보
        BidInfo currentBid = redisRepo.getBid(draftId);

        // 3. 남은 시간
        Integer remainingSeconds = null;
        if (currentRound != null) {
            remainingSeconds = redisRepo.getRemainingSeconds(draftId);
        }

        // 4. 대기열 정보
        List<DraftMemberResponse> queue = getDraftQueue(draftId);

        // 5. 다음 선수 이름 (대기열 첫 번째)
        String nextPlayerName = queue.isEmpty() ? null : queue.get(0).getName();

        // 6. 팀 정보
        List<TeamInfoResponse> teams = getTeamInfos(draftId);

        return AuctionInitialDataResponse.of(
                currentRound,
                currentBid,
                remainingSeconds,
                queue,
                nextPlayerName,
                teams
        );
    }

    public List<DraftMemberResponse> getDraftQueue(Long draftId) {
        // 현재 경매 진행 중인 멤버 ID 조회
        RoundStatus currentRound = redisRepo.getCurrent(draftId);
        Long currentDraftMemberId = (currentRound != null) ? currentRound.getDraftMemberId() : null;

        // WAITING과 SKIPPED 상태인 멤버만 조회 (COMPLETED는 제외)
        // turnOrder가 NULL인 경우(팀장)도 제외
        // 현재 경매 진행 중인 멤버도 제외
        List<DraftMember> draftMembers = draftMemberRepo.findAllByDraftIdOrderByTurnOrderAsc(draftId).stream()
                .filter(dm -> (dm.getStatus() == kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus.WAITING
                            || dm.getStatus() == kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus.SKIPPED)
                            && dm.getTurnOrder() != null
                            && !dm.getId().equals(currentDraftMemberId))  // 현재 경매 대상자 제외
                .toList();


        // N+1 문제 방지: 모든 memberId 수집하여 한 번에 MemberStat 조회
        List<Long> memberIds = draftMembers.stream()
                .map(dm -> dm.getMember().getId())
                .distinct()
                .collect(Collectors.toList());

        // 활성 시즌 기준으로 MemberStat 조회
        var memberStatMap = memberStatService.getMemberStatsForCurrentSeason(memberIds);

        return draftMembers.stream()
                .map(dm -> {
                    MemberStat stat = memberStatMap.get(dm.getMember().getId());
                    return DraftMemberResponse.from(dm, stat,
                        dataDragonService.getProfileIconUrl(dm.getMember().getProfileIconId()));
                })
                .collect(Collectors.toList());
    }

public List<TeamInfoResponse> getTeamInfos(Long draftId) {
    // 1. 해당 드래프트의 모든 팀 조회
    List<Team> teams = teamRepo.findAllByDraftId(draftId);

    // 2. 각 팀별로 DTO 생성
    return teams.stream().map(team -> {
        // [수정] 실시간 포인트 조회: DB 대신 Redis에서 조회 (없으면 DB 값 사용)
        Integer redisPoint = redisRepo.getTeamPoint(draftId, team.getId());
        int currentPoint = (redisPoint != null) ? redisPoint : team.getPoint();

        // 해당 팀의 팀원 조회 (Member를 fetch join하여 LazyInitializationException 방지)
        List<Teammate> teammates = teammateRepo.findByTeamIdWithMember(team.getId());

        // 팀원들의 memberId 수집
        List<Long> memberIds = teammates.stream()
                .map(tm -> tm.getMember().getId())
                .distinct()
                .collect(Collectors.toList());

        // MemberStat 일괄 조회 (활성 시즌 기준)
        var memberStatMap = memberStatService.getMemberStatsForCurrentSeason(memberIds);

        // Teammate -> TeammateResponse 변환
        List<TeammateResponse> memberResponses = teammates.stream()
                .map(tm -> TeammateResponse.from(
                        tm,
                        dataDragonService.getProfileIconUrl(tm.getMember().getProfileIconId()),
                        memberStatMap.get(tm.getMember().getId())
                ))
                .collect(Collectors.toList());

        // TeamInfoResponse 직접 빌드 (Redis Point 반영)
        return TeamInfoResponse.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .currentPoint(currentPoint)
                .members(memberResponses)
                .build();
    }).collect(Collectors.toList());
}
}
