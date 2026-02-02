package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.redis.AuctionKey;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 경매 종료 처리 전용 서비스
 * RoundStartService의 트랜잭션 자가 호출 문제 해결을 위해 분리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionFinishService {

    private final DraftRepository draftRepository;
    private final TeamRepository teamRepo;
    private final RedisAuctionRepository redisRepo;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatWebSocketController chatWebSocketController;

    /**
     * 경매 종료 처리
     * - Draft 상태를 COMPLETED로 변경
     * - 모든 Redis 데이터 정리
     */
    @Transactional
    public void finishAuction(Long draftId) {
        log.info("[Auction Finish] Starting finalization for draftId: {}", draftId);

        // 1. Draft 상태를 COMPLETED로 변경
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));

        draft.updateStatus(DraftStatus.COMPLETED);
        draftRepository.save(draft);

        log.info("[Auction Finish] Draft status updated to COMPLETED for draftId: {}", draftId);

        // 2. 팀 목록 조회
        List<Team> teams = teamRepo.findAllByDraftId(draftId);

        // 3. 모든 Redis 데이터 정리
        clearAllRedisData(draftId, teams);

        // 4. 채팅 시스템 메시지 - 경매 종료
        chatWebSocketController.sendSystemMessage(draftId, "🎉 모든 경매가 종료되었습니다!");

        log.info("[Auction Finish] Completed for draftId: {}. Status changed to COMPLETED", draftId);
    }

    /**
     * Draft의 모든 Redis 데이터 정리
     * - current, bid, timer (경매 상태)
     * - teamPoint, teamLeader, teamPositions (팀 데이터)
     */
    private void clearAllRedisData(Long draftId, List<Team> teams) {
        // 경매 관련 키 삭제
        redisRepo.clear(draftId);

        // 각 팀의 데이터 삭제
        for (Team team : teams) {
            redisRepo.clearTeamPositions(draftId, team.getId());
            // teamPoint와 teamLeader도 삭제
            redisTemplate.delete(AuctionKey.teamPoint(draftId, team.getId()));
            redisTemplate.delete(AuctionKey.teamLeader(draftId, team.getId()));
        }

        log.info("[Auction Finish] All Redis data cleared for draftId: {}", draftId);
    }
}
