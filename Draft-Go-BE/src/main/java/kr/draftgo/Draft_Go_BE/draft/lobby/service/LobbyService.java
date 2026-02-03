package kr.draftgo.Draft_Go_BE.draft.lobby.service;

import kr.draftgo.Draft_Go_BE.draft.auction.service.RoundStartService;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.dto.CodeInfo;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.common.dto.LeaderDetail;
import kr.draftgo.Draft_Go_BE.draft.common.dto.MemberDetail;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ChangePositionReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ChangeRoleReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.request.ReadyToggleReq;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.response.LobbyInfoRes;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.response.UserSummary;
import kr.draftgo.Draft_Go_BE.draft.lobby.event.DraftStartedEvent;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.match.repository.MostChampionStatRepository;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.service.MemberStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 로비 관리 서비스
 * 로비 정보 조회, 역할/포지션 변경, 준비 완료, 드래프트 시작 등의 기능 제공
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LobbyService {

    private final DraftRepository draftRepository;
    private final MemberRepository memberRepository;
    private final MemberStatService memberStatService;
    private final MostChampionStatRepository mostChampionStatRepository;
    private final DataDragonService dataDragonService;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final LobbyWebSocketService lobbyWebSocketService;
    private final DraftInitializationService draftInitializationService;
    private final ChatWebSocketController chatWebSocketController;
    private final RoundStartService roundStartService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 로비 정보 조회
     */
    public LobbyInfoRes getLobbyInfo(Long draftId, Long requesterId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draftId);

        // 모든 참가자의 memberId 수집
        List<Long> memberIds = participants.stream()
                .map(LobbyParticipant::getMemberId)
                .distinct()
                .collect(Collectors.toList());

        // N+1 문제 방지: 한 번에 모든 MemberStat 조회 (활성 시즌 기준)
        var memberStatMap = memberStatService.getMemberStatsForCurrentSeason(memberIds);

        // 팀장의 Member 정보 조회 (프로필 아이콘용)
        List<Long> leaderIds = participants.stream()
                .filter(p -> "LEADER".equals(p.getRole()))
                .map(LobbyParticipant::getMemberId)
                .collect(Collectors.toList());

        Map<Long, Member> leaderMemberMap = memberRepository.findAllById(leaderIds).stream()
                .collect(Collectors.toMap(Member::getId, m -> m));

        // 팀장의 모스트 챔피언 정보 조회 (DataDragonService 활용)
        Map<Long, List<MostChampionRes>> leaderMostChampionsMap = leaderIds.stream()
                .collect(Collectors.toMap(
                        memberId -> memberId,
                        memberId -> mostChampionStatRepository.findByMemberId(memberId)
                                .map(mostStat -> mostStat.getMostChampions().stream()
                                        .map(champ -> {
                                            // DataDragonService를 통해 아이콘 URL 및 한글 이름 조회
                                            String championIconUrl = dataDragonService
                                                    .getChampionIconUrl(champ.getChampionName());
                                            String koreanName = dataDragonService
                                                    .getKoreanChampionName(champ.getChampionName());

                                            // MostChampionRes 생성 (빌더 패턴 활용)
                                            return MostChampionRes.builder()
                                                    .championId(champ.getChampionId())
                                                    .championName(
                                                            koreanName != null ? koreanName : champ.getChampionName()) // 한글
                                                                                                                       // 이름
                                                                                                                       // 우선
                                                                                                                       // 사용
                                                    .championIconUrl(championIconUrl)
                                                    .totalGames(champ.getTotalGames())
                                                    .totalWins(champ.getTotalWins())
                                                    .totalLosses(champ.getTotalLosses())
                                                    .winRate(champ.getWinRate())
                                                    .kda(champ.getKda())
                                                    .build();
                                        })
                                        .collect(Collectors.toList()))
                                .orElse(Collections.emptyList())));

        // Leaders: role이 "LEADER"인 참가자
        List<LeaderDetail> leaders = participants.stream()
                .filter(p -> "LEADER".equals(p.getRole()))
                .map(p -> {
                    MemberStat stat = memberStatMap.get(p.getMemberId());
                    Member member = leaderMemberMap.get(p.getMemberId());

                    // 프로필 아이콘 URL 생성
                    String profileIconUrl = null;
                    if (member != null && member.getProfileIconId() != null) {
                        profileIconUrl = dataDragonService.getProfileIconUrl(member.getProfileIconId());
                    }

                    // 모스트 챔피언 정보
                    List<MostChampionRes> mostChampions = leaderMostChampionsMap.getOrDefault(
                            p.getMemberId(), Collections.emptyList());

                    return LeaderDetail.builder()
                            .id(p.getMemberId())
                            .name(p.getGameName())
                            .position(p.getPosition())
                            .isReady(p.isReady())
                            .tier(stat != null ? stat.getTier() : null)
                            .division(stat != null ? stat.getDivision() : null)
                            .leaguePoints(stat != null ? stat.getLeaguePoint() : null)
                            .leaderPoint(p.getLeaderPoint())
                            .profileIconUrl(profileIconUrl)
                            .mostChampions(mostChampions)
                            .build();
                })
                .collect(Collectors.toList());

        // Members: role이 "MEMBER"이고 position이 OBSERVER가 아닌 참가자
        List<MemberDetail> members = participants.stream()
                .filter(p -> "MEMBER".equals(p.getRole()) && p.getPosition() != Position.OBSERVER)
                .map(p -> {
                    MemberStat stat = memberStatMap.get(p.getMemberId());
                    return MemberDetail.builder()
                            .id(p.getMemberId())
                            .name(p.getGameName())
                            .position(p.getPosition())
                            .tier(stat != null ? stat.getTier() : null)
                            .division(stat != null ? stat.getDivision() : null)
                            .leaguePoints(stat != null ? stat.getLeaguePoint() : null)
                            .build();
                })
                .collect(Collectors.toList());

        // Observers: position이 OBSERVER인 참가자
        List<UserSummary> observers = participants.stream()
                .filter(p -> p.getPosition() == Position.OBSERVER)
                .map(p -> UserSummary.builder()
                        .id(p.getMemberId())
                        .name(p.getGameName())
                        .build())
                .collect(Collectors.toList());

        // 관리자인지 확인
        boolean isAdmin = draft.getOwner().getId().equals(requesterId);

        // 관리자만 초대 코드 조회 가능
        CodeInfo codes = null;
        if (isAdmin) {
            codes = CodeInfo.builder()
                    .teamMemberCode(draft.getMemberCode())
                    .teamLeaderCode(draft.getLeaderCode())
                    .build();
        }

        return LobbyInfoRes.builder()
                .draftId(draft.getId())
                .ownerId(draft.getOwner().getId())
                .title(draft.getTitle())
                .maxTeamCount(draft.getMaxTeamCount())
                .startPoint(draft.getStartPoint())
                .startPrice(draft.getStartPrice())
                .thumbnailUrl(draft.getThumbnailUrl())
                .status(draft.getStatus())
                .leaders(leaders)
                .members(members)
                .observers(observers)
                .codes(codes)
                .draftSnapshot(null)
                .build();
    }

    /**
     * 역할 변경 (관리자 전용)
     */
    @Transactional
    public void changeRole(Long draftId, ChangeRoleReq req, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 역할을 변경할 수 있습니다.");
        }

        // 팀장으로 변경 시 검증
        if ("LEADER".equals(req.getRole())) {
            LobbyParticipant participant = lobbyRedisRepository.getParticipant(draftId, req.getTargetUserId());

            // 현재 포지션이 OBSERVER이면 에러
            if (participant != null && participant.getPosition() == Position.OBSERVER) {
                throw new CustomException(ErrorType.LEADER_CANNOT_BE_OBSERVER);
            }

            // 현재 팀장이 아닌 경우에만 팀장 수 확인 (이미 팀장이면 카운트 변경 없음)
            if (participant != null && !"LEADER".equals(participant.getRole())) {
                List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draftId);
                long currentLeaderCount = participants.stream()
                        .filter(p -> "LEADER".equals(p.getRole()))
                        .count();

                if (currentLeaderCount >= draft.getMaxTeamCount()) {
                    throw new CustomException(ErrorType.MAX_TEAM_COUNT_EXCEEDED);
                }
            }
        }

        lobbyRedisRepository.changeRole(draftId, req.getTargetUserId(), req.getRole());

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.ROLE_CHANGED);
    }

    /**
     * 포지션 변경
     */
    @Transactional
    public void changePosition(Long draftId, ChangePositionReq req, Long memberId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 본인 또는 관리자만 포지션 변경 가능
        if (!draft.getOwner().getId().equals(memberId) && !req.getTargetUserId().equals(memberId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_POSITION_CHANGE);
        }

        // 팀장이 관전자가 되는 것을 방지
        LobbyParticipant participant = lobbyRedisRepository.getParticipant(draftId, req.getTargetUserId());
        if (participant != null && "LEADER".equals(participant.getRole()) && req.getPosition() == Position.OBSERVER) {
            throw new CustomException(ErrorType.LEADER_CANNOT_BE_OBSERVER);
        }

        lobbyRedisRepository.changePosition(draftId, req.getTargetUserId(), req.getPosition());

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.POSITION_CHANGED);
    }

    /**
     * 참가자 강제 퇴장 (관리자 전용) 또는 자기 자신 퇴장
     */
    @Transactional
    public void kickUser(Long draftId, Long targetUserId, Long requesterId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 로비 상태가 아니면 퇴장 불가
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 퇴장할 수 있습니다.");
        }

        // 관리자(방장)는 방을 나갈 수 없음
        if (draft.getOwner().getId().equals(targetUserId)) {
            throw new CustomException(ErrorType.OWNER_CANNOT_EXIT, "관리자(방장)는 방을 나갈 수 없습니다.");
        }

        // 자기 자신을 퇴장시키거나 관리자 권한 확인
        if (!targetUserId.equals(requesterId) && !draft.getOwner().getId().equals(requesterId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 다른 참가자를 퇴장시킬 수 있습니다.");
        }

        // 퇴장 전 참가자 정보 가져오기 (채팅 알림용)
        LobbyParticipant participant = lobbyRedisRepository.getParticipant(draftId, targetUserId);
        String nickname = participant != null ? participant.getGameName() : "알 수 없는 사용자";

        lobbyRedisRepository.removeParticipant(draftId, targetUserId);

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.PARTICIPANT_LEFT);

        // 채팅 퇴장 알림
        chatWebSocketController.sendLeaveMessage(draftId, nickname);
    }

    /**
     * 팀장 포인트 설정 (관리자 전용)
     */
    @Transactional
    public void setLeaderPoint(Long draftId, Long leaderId, Integer point, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 팀장 포인트를 설정할 수 있습니다.");
        }

        lobbyRedisRepository.setLeaderPoint(draftId, leaderId, point);

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.LEADER_POINT_CHANGED);
    }

    /**
     * 초대 코드 리프레시 (관리자 전용)
     */
    @Transactional
    public void refreshInviteCode(Long draftId, String codeType, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 초대 코드를 리프레시할 수 있습니다.");
        }

        // 코드 타입에 따라 적절한 메서드 호출
        if ("LEADER".equalsIgnoreCase(codeType)) {
            draft.refreshLeaderCode();
        } else if ("MEMBER".equalsIgnoreCase(codeType)) {
            draft.refreshMemberCode();
        } else {
            throw new CustomException(ErrorType.INVALID_CODE_TYPE, "잘못된 코드 타입입니다. LEADER 또는 MEMBER만 가능합니다.");
        }

        draftRepository.save(draft);

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.INVITE_CODE_REFRESHED);
    }

    /**
     * 준비 완료 토글 (팀장 전용)
     */
    @Transactional
    public void toggleReady(Long draftId, ReadyToggleReq req, Long leaderId) {
        // 드래프트 존재 여부 확인
        draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        LobbyParticipant participant = lobbyRedisRepository.getParticipant(draftId, leaderId);
        if (participant == null) {
            throw new CustomException(ErrorType.PARTICIPANT_NOT_FOUND);
        }

        if (!"LEADER".equals(participant.getRole())) {
            throw new CustomException(ErrorType.UNAUTHORIZED_LEADER_ONLY, "팀장만 준비 완료 상태를 변경할 수 있습니다.");
        }

        lobbyRedisRepository.toggleReady(draftId, leaderId, req.getIsReady());

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.READY_STATUS_CHANGED);
    }

    /**
     * 드래프트 시작 (관리자 전용)
     */
    @Transactional
    public void startDraft(Long draftId, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 드래프트를 시작할 수 있습니다.");
        }

        List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draftId);

        // 1. 시작 전 검증
        validateDraftStart(draft, participants);

        // 2. 드래프트 상태를 IN_DRAFT로 변경
        draft.startDraft();
        draftRepository.save(draft);

        // 3. 팀 및 멤버 초기화 (DraftInitializationService로 위임)
        draftInitializationService.initializeDraft(draft, participants);

        // 4. 경매 자동 시작
        roundStartService.startNextRound(draftId);

        // 5. 트랜잭션 커밋 후 WebSocket 브로드캐스트를 위한 이벤트 발행
        // 이벤트는 트랜잭션이 성공적으로 커밋된 이후에 처리됨
        eventPublisher.publishEvent(new DraftStartedEvent(draftId));
    }

    /**
     * 드래프트 시작 전 검증
     */
    private void validateDraftStart(Draft draft, List<LobbyParticipant> participants) {
        // 모든 팀장이 준비 완료 상태인지 확인
        List<LobbyParticipant> leaders = participants.stream()
                .filter(p -> "LEADER".equals(p.getRole()))
                .toList();

        if (leaders.isEmpty()) {
            throw new CustomException(ErrorType.NO_LEADERS);
        }

        boolean allReady = leaders.stream().allMatch(LobbyParticipant::isReady);
        if (!allReady) {
            throw new CustomException(ErrorType.LEADERS_NOT_READY);
        }

        // 포지션 균일성 검증 (OBSERVER 제외한 참가자들)
        List<LobbyParticipant> playingParticipants = participants.stream()
                .filter(p -> p.getPosition() != Position.OBSERVER)
                .toList();

        if (playingParticipants.isEmpty()) {
            throw new CustomException(ErrorType.NO_PLAYING_PARTICIPANTS);
        }

        // 각 포지션별 참가자 수 계산
        Map<Position, Long> positionCount = playingParticipants.stream()
                .collect(Collectors.groupingBy(
                        LobbyParticipant::getPosition,
                        Collectors.counting()));

        // 필수 포지션 목록 (TOP, JUNGLE, MID, BOT, SUP)
        List<Position> requiredPositions = List.of(
                Position.TOP,
                Position.JUNGLE,
                Position.MID,
                Position.BOT,
                Position.SUP);

        // 모든 필수 포지션이 존재하는지 확인
        for (Position position : requiredPositions) {
            if (!positionCount.containsKey(position) || positionCount.get(position) == 0) {
                throw new CustomException(
                        ErrorType.POSITION_MISSING,
                        String.format("%s 포지션 참가자가 없습니다.", position.getDisplayName()));
            }
        }

        // 모든 포지션의 참가자 수가 동일한지 확인
        long firstCount = positionCount.get(Position.TOP);
        boolean isBalanced = requiredPositions.stream()
                .allMatch(pos -> positionCount.getOrDefault(pos, 0L).equals(firstCount));

        if (!isBalanced) {
            StringBuilder message = new StringBuilder("포지션별 참가자 수가 균일하지 않습니다. (");
            for (Position position : requiredPositions) {
                long count = positionCount.getOrDefault(position, 0L);
                message.append(position.getDisplayName()).append(": ").append(count).append("명, ");
            }
            message.setLength(message.length() - 2); // 마지막 ", " 제거
            message.append(")");
            throw new CustomException(ErrorType.POSITION_UNBALANCED, message.toString());
        }
    }

    /**
     * 방 폭파 (관리자 전용)
     * 로비 상태의 드래프트를 강제로 삭제하고 모든 참가자를 퇴장시킵니다.
     */
    @Transactional
    public void destroyDraft(Long draftId, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 방을 폭파할 수 있습니다.");
        }

        // 로비 상태가 아니면 폭파 불가
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 방을 폭파할 수 있습니다.");
        }

        // WebSocket으로 방 폭파 알림 (먼저 전송)
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.DRAFT_DESTROYED);

        // 채팅으로 방 폭파 알림
        chatWebSocketController.sendSystemMessage(draftId, "관리자가 방을 폭파했습니다. 모든 참가자가 퇴장되었습니다.");

        // Redis 로비 데이터 삭제
        lobbyRedisRepository.clear(draftId);

        // DB에서 드래프트 완전 삭제
        draftRepository.delete(draft);
    }
}
