package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionPhase;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.DraftMemberResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeamInfoResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeammateResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {

    private final RedisAuctionRepository redisRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final DraftRepository draftRepository;
    private final TeamRepository teamRepo;
    private final TeammateRepository teammateRepo;
    private final AuctionEventPublisher publisher;
    private final ChatWebSocketController chatWebSocketController;
    private final MemberStatRepository memberStatRepository;

    /**
     * 경매 시작 (관리자 권한 체크 포함)
     * - Controller에서 호출되며, 관리자 권한을 검증합니다.
     * - 경매가 중단되었을 때 수동으로 재개하는 용도입니다.
     */
    @Transactional
    public void processNextRoundByOwner(Long draftId, Member admin) {
        // 관리자 권한 확인
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        if (!draft.getOwner().getId().equals(admin.getId())) {
            throw new CustomException(ErrorType.UNAUTHORIZED_ADMIN_ONLY, "관리자만 경매를 시작할 수 있습니다.");
        }

        // 실제 경매 시작 로직 호출
        processNextRound(draftId);
    }

    /**
     * 경매 시작 (내부 로직)
     * - 관리자 권한 체크 없이 내부 로직에서 호출됩니다.
     * - LobbyService.startDraft()에서 자동으로 호출됩니다.
     * - AuctionTimeOverService.completeAuction()에서 다음 경매를 시작할 때도 호출됩니다.
     * - 멱등성 보장: 이미 진행 중인 경매가 있으면 무시됩니다.
     */
    @Transactional
    public void processNextRound(Long draftId) {
        // 멱등성 보장: 이미 진행 중인 경매가 있는지 확인
        RoundStatus currentRound = redisRepo.getCurrent(draftId);
        if (currentRound != null) {
            log.warn("Auction already in progress for draftId: {}. Skipping processNextRound.", draftId);
            return;
        }

        // 1. WAITING 멤버 먼저 확인
        Optional<DraftMember> nextWaiting = draftMemberRepo.findNextWaiting(draftId);

        if (nextWaiting.isPresent()) {
            startAuctionForMember(draftId, nextWaiting.get());
        } else {
            // 2. WAITING이 없으면 SKIPPED 멤버 확인
            Optional<DraftMember> nextSkipped = draftMemberRepo.findNextSkipped(draftId);

            if (nextSkipped.isPresent()) {
                log.info("All WAITING members processed. Starting SKIPPED queue for draftId: {}", draftId);
                startAuctionForMember(draftId, nextSkipped.get());
            } else {
                // 3. WAITING도 SKIPPED도 없으면 경매 종료
                finishAuction(draftId);
            }
        }
    }

    private void startAuctionForMember(Long draftId, DraftMember next) {
        // Redis에 경매 상태 설정 (DB 상태는 WAITING 유지)
        RoundStatus state = RoundStatus.start(draftId, next.getId(), next.getName());
        redisRepo.setCurrent(draftId, state);
        redisRepo.startTimer(draftId, 30);
        publisher.newBidding(draftId, state);

        // 채팅 시스템 메시지 - 경매 시작
        chatWebSocketController.sendSystemMessage(draftId,
            "🎯 현재 선수: " + next.getName());
    }

    private void finishAuction(Long draftId) {
        log.info("No more members to draft. Auction finished for draftId: {}", draftId);

        // [최적화] 경매 종료 시 Redis에 있는 최종 팀 포인트를 DB에 일괄 반영
        List<Team> teams = teamRepo.findAllByDraftId(draftId);
        for (Team team : teams) {
            Integer finalPoint = redisRepo.getTeamPoint(draftId, team.getId());
            if (finalPoint != null) {
                team.updatePoint(finalPoint);
            }
        }
        teamRepo.saveAll(teams);
        log.info("Final team points synchronized to DB for draftId: {}", draftId);

        // 채팅 시스템 메시지 - 경매 종료
        chatWebSocketController.sendSystemMessage(draftId, "🎉 모든 경매가 종료되었습니다!");
    }

    public AuctionStatusResponse getCurrentState(Long draftId) {
        // Draft 상태 조회
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        DraftStatus draftStatus = draft.getStatus();
        RoundStatus state = redisRepo.getCurrent(draftId);
        BidInfo bid = redisRepo.getBid(draftId);
        String nextPlayerName = draftMemberRepo.findNextUpcoming(draftId)
                .map(DraftMember::getName)
                .orElse(null);

        // 경매 전체 상태 판단
        AuctionPhase auctionPhase = determineAuctionPhase(draftStatus, state);

        // 타이머 남은 시간 (진행 중일 때만 의미 있음)
        Integer remainingTime = null;
        if (auctionPhase == AuctionPhase.IN_PROGRESS) {
            remainingTime = redisRepo.getRemainingTime(draftId);
        }

        return AuctionStatusResponse.of(auctionPhase, remainingTime, state, bid, nextPlayerName);
    }

    /**
     * Draft 상태와 Redis 상태를 기반으로 경매 전체 진행 상태를 판단
     */
    private AuctionPhase determineAuctionPhase(DraftStatus draftStatus, RoundStatus roundStatus) {
        return switch (draftStatus) {
            case COMPLETED -> AuctionPhase.COMPLETED;
            case IN_DRAFT -> {
                // IN_DRAFT 상태에서 Redis에 라운드 상태가 있고 타이머도 있으면 진행 중
                if (roundStatus != null && redisRepo.hasTimer(roundStatus.getDraftId())) {
                    yield AuctionPhase.IN_PROGRESS;
                }
                // IN_DRAFT 상태인데 타이머가 없으면 중단됨
                yield AuctionPhase.INTERRUPTED;
                // IN_DRAFT 상태인데 타이머가 없으면 중단됨
            }
            default -> AuctionPhase.NOT_STARTED;
        };
    }

    public List<DraftMemberResponse> getDraftQueue(Long draftId) {
        // WAITING과 SKIPPED 상태인 멤버만 조회 (COMPLETED는 제외)
        List<DraftMember> draftMembers = draftMemberRepo.findAllByDraftIdOrderByTurnOrderAsc(draftId).stream()
                .filter(dm -> dm.getStatus() == kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus.WAITING
                           || dm.getStatus() == kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus.SKIPPED)
                .toList();

        // N+1 문제 방지: 모든 memberId 수집하여 한 번에 MemberStat 조회
        List<Long> memberIds = draftMembers.stream()
                .map(dm -> dm.getMember().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, MemberStat> memberStatMap = memberStatRepository.findByMemberIdIn(memberIds).stream()
                .collect(Collectors.toMap(MemberStat::getMemberId, stat -> stat));

        return draftMembers.stream()
                .map(dm -> {
                    MemberStat stat = memberStatMap.get(dm.getMember().getId());
                    return DraftMemberResponse.from(dm, stat);
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

            // 해당 팀의 팀원 조회
            List<Teammate> teammates = teammateRepo.findByTeamId(team.getId());

            // Teammate -> TeammateResponse 변환
            List<TeammateResponse> memberResponses = teammates.stream()
                    .map(TeammateResponse::from)
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
