package kr.draftgo.Draft_Go_BE.draft.auction.service;

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
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
     */
    @Transactional
    public void processNextRound(Long draftId) {
        draftMemberRepo.findNextWaiting(draftId).ifPresentOrElse(next -> {
            // [추가] DB 상태 업데이트: WAITING -> BIDDING
            next.bidding(); // Entity method to change status
            draftMemberRepo.save(next);

            RoundStatus state = RoundStatus.start(draftId, next.getId(), next.getName());
            redisRepo.setCurrent(draftId, state);
            redisRepo.startTimer(draftId, 30);
            publisher.newBidding(draftId, state);

            // 채팅 시스템 메시지 - 경매 시작
            chatWebSocketController.sendSystemMessage(draftId,
                "🎯 현재 선수: " + next.getName());
        }, () -> {
            log.info("No more members to draft. Auction finished for draftId: {}", draftId);

            // [최적화] 경매 종료 시 Redis에 있는 최종 팀 포인트를 DB에 일괄 반영
            List<Team> teams = teamRepo.findAllByDraftId(draftId);
            for (Team team : teams) {
                Integer finalPoint = redisRepo.getTeamPoint(draftId, team.getId());
                if (finalPoint != null) {
                    // Team 엔티티에 point 필드에 대한 setter나 update 메서드가 필요함.
                    // 현재는 빌더 패턴만 보이므로, setter가 없다면 엔티티 수정 필요 가능성 있음.
                    // 우선 간단히 setter가 있다고 가정하거나, 리플렉션 없이 처리하려면 도메인 메서드 추가 권장.
                    // 여기서는 도메인 주도 설계를 위해 updatePoint 메서드를 가정하고 호출.
                    // 만약 없다면 Team 엔티티에 추가해야 함.
                    team.updatePoint(finalPoint);
                }
            }
            teamRepo.saveAll(teams);
            log.info("Final team points synchronized to DB for draftId: {}", draftId);

            // 채팅 시스템 메시지 - 경매 종료
            chatWebSocketController.sendSystemMessage(draftId, "🎉 모든 경매가 종료되었습니다!");
        });
    }

    public AuctionStatusResponse getCurrentState(Long draftId) {
        RoundStatus state = redisRepo.getCurrent(draftId);
        BidInfo bid = redisRepo.getBid(draftId);
        String nextPlayerName = draftMemberRepo.findNextUpcoming(draftId)
                .map(DraftMember::getName)
                .orElse(null);
        return AuctionStatusResponse.of(state, bid, nextPlayerName);
    }

    public List<DraftMemberResponse> getDraftQueue(Long draftId) {
        return draftMemberRepo.findAllByDraftIdOrderByTurnOrderAsc(draftId).stream()
                .map(DraftMemberResponse::from)
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
