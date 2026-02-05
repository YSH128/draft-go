package kr.draftgo.Draft_Go_BE.draft.auction.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.event.AuctionWebSocketEvent;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RoundLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.*;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.match.repository.MostChampionStatRepository;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.member.domain.*;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import kr.draftgo.Draft_Go_BE.member.service.SeasonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 새 라운드 시작을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoundStartService {

    private final RoundLuaExecutor roundLuaExecutor;
    private final DraftMemberRepository draftMemberRepo;
    private final DraftRepository draftRepository;
    private final AuctionFinishService auctionFinishService;
    private final TeamRepository teamRepo;
    private final TeammateRepository teammateRepo;
    private final ChatWebSocketController chatWebSocketController;
    private final DataDragonService dataDragonService;
    private final ObjectMapper objectMapper;
    private final RedisAuctionRepository redisRepo;
    private final MostChampionStatRepository mostChampionStatRepository;
    private final MemberStatRepository memberStatRepository;
    private final SeasonService seasonService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 경매 시작 (관리자 권한 체크 포함)
     * - Controller에서 호출되며, 관리자 권한을 검증합니다.
     * - 경매가 중단되었을 때 수동으로 재개하는 용도입니다.
     */
    @Transactional
    public void startNextRoundByOwner(Long draftId, Member admin) {
        // 관리자 권한 확인
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        if (!draft.getOwner().getId().equals(admin.getId())) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 경매를 시작할 수 있습니다.");
        }

        startNextRound(draftId);
    }

    /**
     * 다음 라운드 시작
     * DB 조회와 Lazy 로딩이 필요하므로 트랜잭션 내에서 실행
     */
    @Transactional
    public void startNextRound(Long draftId) {
        // 0. Redis에 팀 캐싱 데이터(포인트, 팀장, 보유 포지션)가 없으면 DB에서 조회하여 초기화
        initializeTeamDataIfNeeded(draftId);

        // 1. 다음 멤버 찾기 (WAITING 우선, 없으면 SKIPPED)
        Optional<DraftMember> nextMember = draftMemberRepo.findNextWaiting(draftId);
        boolean isSkippedRound = false;  // 유찰 단계 여부

        if (nextMember.isEmpty()) {
            nextMember = draftMemberRepo.findNextSkipped(draftId);
            isSkippedRound = true;  // SKIPPED 큐 진행 중

            if (nextMember.isEmpty()) {
                // 경매 종료 - 별도 서비스로 위임
                auctionFinishService.finishAuction(draftId);
                return;
            }

            log.info("All WAITING members processed. Starting SKIPPED queue for draftId: {}", draftId);
        }

        DraftMember next = nextMember.get();

        // Draft 정보 조회 (최소 입찰가 결정을 위해)
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));

        // 유찰 단계면 0포인트, 일반 단계면 startPrice
        Integer minBidPrice = isSkippedRound ? 0 : draft.getStartPrice();

        // 2. MemberStat 조회 (활성 시즌 기준)
        SeasonDocument activeSeason = seasonService.getActiveSeason();
        String seasonId = activeSeason != null ? activeSeason.getSeasonId() : null;

        MemberStat memberStat = null;
        if (seasonId != null) {
            memberStat = memberStatRepository.findByMember_IdAndSeasonId(next.getMember().getId(), seasonId)
                    .orElse(null);
        }

        Tier tier = memberStat != null ? memberStat.getTier() : null;
        Division division = memberStat != null ? memberStat.getDivision() : null;

        // 3. 모스트 챔피언 조회 (최대 3개) - championIconUrl 포함, 한글 이름 사용
        List<MostChampionRes> mostChampions = mostChampionStatRepository.findByMemberId(next.getMember().getId())
                .map(mostStat -> mostStat.getMostChampions().stream()
                        .limit(3)
                        .map(champ -> {
                            String englishName = champ.getChampionName();
                            String koreanName = dataDragonService.getKoreanChampionName(englishName); // 한글 이름으로 변환
                            String championIconUrl = dataDragonService.getChampionIconUrl(englishName); // URL은 영어로
                            return MostChampionRes.builder()
                                    .championId(champ.getChampionId())
                                    .championName(koreanName) // 한글 이름 사용
                                    .championIconUrl(championIconUrl)
                                    .totalGames(champ.getTotalGames())
                                    .totalWins(champ.getTotalWins())
                                    .totalLosses(champ.getTotalLosses())
                                    .winRate(champ.getTotalGames() > 0
                                            ? (int) Math
                                                    .round((double) champ.getTotalWins() / champ.getTotalGames() * 100)
                                            : 0)
                                    .kda(champ.getKda())
                                    .build();
                        })
                        .collect(Collectors.toList()))
                .orElse(null);

        // 4. 새 라운드 상태 생성
        RoundStatus newRoundState = RoundStatus.start(
                draftId,
                next.getId(),
                next.getTurnOrder() == null ? 0 : next.getTurnOrder(),
                next.getName(),
                dataDragonService.getProfileIconUrl(next.getMember().getProfileIconId()),
                tier,
                division,
                next.getPosition(), // 경매 포지션
                next.getMember().getMainPosition(), // 주 포지션
                next.getMember().getSubPosition(), // 부 포지션
                mostChampions, // 모스트 챔피언 (championIconUrl 포함)
                minBidPrice
        );

        // 5. JSON 직렬화
        String newRoundStateJson;
        try {
            newRoundStateJson = objectMapper.writeValueAsString(newRoundState);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize RoundStatus", e);
            throw new RuntimeException("Failed to serialize RoundStatus", e);
        }

        // 4. Lua 스크립트로 원자적으로 라운드 시작 (15초 타이머)
        int result = roundLuaExecutor.startRound(draftId, newRoundStateJson, 15);

        if (result == 0) {
            log.warn("Auction already in progress for draftId: {}. Skipping startNextRound.", draftId);
            return; // 이미 진행 중
        }

        // 5. 이벤트 발행 (트랜잭션 커밋 후 WebSocket 브로드캐스트)
        eventPublisher.publishEvent(new AuctionWebSocketEvent.RoundStartEvent(draftId, newRoundState));
        eventPublisher.publishEvent(new AuctionWebSocketEvent.TeamInfoUpdateEvent(draftId));
        eventPublisher.publishEvent(new AuctionWebSocketEvent.QueueUpdateEvent(draftId));

        // 6. 채팅 시스템 메시지 - 현재 선수와 다음 선수 표시
        String systemMessage = buildSystemMessage(draftId, next.getName(),
                next.getTurnOrder() == null ? 0 : next.getTurnOrder());
        chatWebSocketController.sendSystemMessage(draftId, systemMessage);


        log.info("New round started for draftId: {}, player: {}", draftId, next.getName());
    }

    /**
     * 시스템 메시지 생성 (현재 선수 / 다음 선수)
     */
    private String buildSystemMessage(Long draftId, String currentPlayerName, Integer currentTurnOrder) {
        // 현재 선수보다 turnOrder가 큰 다음 선수 찾기
        List<DraftMember> allMembers = draftMemberRepo.findAllByDraftIdOrderByTurnOrderAsc(draftId);

        Optional<DraftMember> nextPlayer = allMembers.stream()
                .filter(dm -> (dm.getStatus() == DraftMemberStatus.WAITING
                        || dm.getStatus() == DraftMemberStatus.SKIPPED))
                .filter(dm -> dm.getTurnOrder() != null && dm.getTurnOrder() > currentTurnOrder)
                .findFirst();

        return nextPlayer
                .map(draftMember -> "현재 선수: " + currentPlayerName + " / 다음 선수: " + draftMember.getName())
                .orElseGet(() -> "마지막 선수: " + currentPlayerName);
    }

    /**
     * Redis에 팀 데이터(포인트, 팀장, 보유 포지션)를 DB와 동기화
     * 주의: 이 메서드는 트랜잭션 내에서 호출되어야 합니다.
     */
    private void initializeTeamDataIfNeeded(Long draftId) {
        List<Team> teams = teamRepo.findAllByDraftId(draftId);

        for (Team team : teams) {
            // 1. 팀 포인트 초기화
            Integer redisPoint = redisRepo.getTeamPoint(draftId, team.getId());
            if (redisPoint == null) {
                redisRepo.setTeamPoint(draftId, team.getId(), team.getPoint());
                log.info("Initialized team point in Redis: draftId={}, teamId={}, point={}",
                        draftId, team.getId(), team.getPoint());
            }

            // 2. 팀장 멤버 ID 초기화 (Member fetch join)
            Long redisLeader = redisRepo.getTeamLeader(draftId, team.getId());
            if (redisLeader == null) {
                teammateRepo.findByTeamIdWithMember(team.getId()).stream()
                        .filter(Teammate::getIsLeader)
                        .findFirst()
                        .ifPresent(leader -> {
                            redisRepo.setTeamLeader(draftId, team.getId(), leader.getMember().getId());
                            log.info("Initialized team leader in Redis: draftId={}, teamId={}, leaderId={}",
                                    draftId, team.getId(), leader.getMember().getId());
                        });
            }

            // 3. 팀이 보유한 포지션 동기화 (매번 DB에서 전체 로드)
            // 기존 Redis 포지션 삭제 후 재생성하여 정확성 보장
            redisRepo.clearTeamPositions(draftId, team.getId());

            List<Teammate> teammates = teammateRepo.findByTeamIdWithMember(team.getId());
            for (Teammate teammate : teammates) {
                String positionName = teammate.getPosition().name();
                redisRepo.addTeamPosition(draftId, team.getId(), positionName);
                log.info("Synced team position to Redis: draftId={}, teamId={}, position={}, isLeader={}",
                        draftId, team.getId(), positionName, teammate.getIsLeader());
            }
        }
    }
}
