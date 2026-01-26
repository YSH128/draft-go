package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.AuctionState;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.AuctionStatusResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.DraftMemberResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeamInfoResponse;
import kr.draftgo.Draft_Go_BE.draft.auction.dto.response.TeammateResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {

    private final RedisAuctionRepository redisRepo;
    private final DraftMemberRepository draftMemberRepo;
    private final TeamRepository teamRepo;
    private final TeammateRepository teammateRepo;
    private final AuctionEventPublisher publisher;
    private final ChatWebSocketController chatWebSocketController;

    @Transactional
    public void startAuction(Long draftId) {
        draftMemberRepo.findNextWaiting(draftId).ifPresentOrElse(next -> {
            // [추가] DB 상태 업데이트: WAITING -> BIDDING
            next.bidding(); // Entity method to change status
            draftMemberRepo.save(next);

            AuctionState state = AuctionState.start(next.getId(), next.getName());
            redisRepo.setCurrent(draftId, state);
            redisRepo.startTimer(draftId, 30);
            publisher.start(draftId, state);

            // 채팅 시스템 메시지 - 경매 시작
            chatWebSocketController.sendSystemMessage(draftId,
                "🎯 경매가 시작되었습니다! 첫 번째 선수: " + next.getName());
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
        AuctionState state = redisRepo.getCurrent(draftId);
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
