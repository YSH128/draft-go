package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.event.LobbyUpdateEvent;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 드래프트 방 생성 및 참가 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DraftJoinService {

    private final DraftRepository draftRepository;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ChatWebSocketController chatWebSocketController;

    /**
     * 드래프트 방 참가
     * - draftId가 있으면 방 ID로 직접 참가 (관리자 재입장용)
     * - draftCode만 있으면 참여 코드로 참가
     */
    @Transactional
    public Long joinRoom(RoomJoinReq req, Member currentMember) {
        // 1. draftCode가 있으면 코드로 참가
        if (req.getDraftCode() != null) {
            return joinRoomByCode(req.getDraftCode(), currentMember, req);
        }

        // 2. draftId가 있으면 방 ID로 직접 참가
        if (req.getDraftId() != null) {
            return joinRoomById(req.getDraftId(), currentMember, req);
        }

        throw new CustomException(ErrorType.INVALID_DRAFT_CODE, "방 ID 또는 참여 코드를 입력해주세요.");
    }

    /**
     * 방 ID로 직접 참가
     */
    private Long joinRoomById(Long draftId, Member member, RoomJoinReq req) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        if (!draft.getOwner().getId().equals(member.getId())) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 방 ID로 참가할 수 있습니다.");
        }

        joinToLobby(draftId, draft, member, req, "MEMBER");

        return draftId;
    }

    /**
     * 참여 코드로 방 참가
     */
    private Long joinRoomByCode(String draftCode, Member member, RoomJoinReq req) {
        // 1. Try to find by Member Code (Candidate)
        Draft draftAsMember = draftRepository.findByMemberCode(draftCode).orElse(null);
        if (draftAsMember != null) {
            joinToLobby(draftAsMember.getId(), draftAsMember, member, req, "MEMBER");
            return draftAsMember.getId();
        }

        // 2. Try to find by Leader Code (Team Leader)
        Draft draftAsLeader = draftRepository.findByLeaderCode(draftCode).orElse(null);
        if (draftAsLeader != null) {
            joinToLobby(draftAsLeader.getId(), draftAsLeader, member, req, "LEADER");
            return draftAsLeader.getId();
        }

        throw new CustomException(ErrorType.INVALID_DRAFT_CODE);
    }

    private void joinToLobby(Long draftId, Draft draft, Member member, RoomJoinReq req, String role) {
        // 이미 참가 중인 경우
        if (lobbyRedisRepository.isParticipating(draftId, member.getId())) {
            throw new CustomException(ErrorType.ALREADY_PARTICIPATING);
        }

        // 드래프트가 로비 상태가 아니면 참가 불가
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 참가할 수 있습니다.");
        }

        // 팀장으로 입장하려는 경우 최대 팀 수 확인
        if ("LEADER".equals(role)) {
            List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draftId);
            long currentLeaderCount = participants.stream()
                    .filter(p -> "LEADER".equals(p.getRole()))
                    .count();

            if (currentLeaderCount >= draft.getMaxTeamCount()) {
                throw new CustomException(ErrorType.MAX_TEAM_COUNT_EXCEEDED);
            }
        }

        // position이 null이면 OBSERVER를 기본값으로 사용
        Position selectedPosition =
                req.getPosition() != null ? req.getPosition() : Position.OBSERVER;

        // 팀장(LEADER)은 OBSERVER 포지션으로 입장할 수 없음
        if ("LEADER".equals(role) && selectedPosition == Position.OBSERVER) {
            throw new CustomException(ErrorType.LEADER_CANNOT_BE_OBSERVER);
        }

        LobbyParticipant participant = LobbyParticipant.builder()
                .memberId(member.getId())
                .gameName(member.getGameName())
                .role(role)
                .position(selectedPosition)
                .isReady(false)
                .build();

        lobbyRedisRepository.join(draftId, participant);

        // WebSocket 브로드캐스트 (트랜잭션 커밋 후)
        eventPublisher.publishEvent(new LobbyUpdateEvent(draftId, LobbyEventType.PARTICIPANT_JOINED));

        // 채팅 입장 알림
        chatWebSocketController.sendJoinMessage(draftId, member.getNickname());
    }
}
