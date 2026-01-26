package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.room.dto.DraftListRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.UpdateDraftInfoReq;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 드래프트 방 생성 및 참가 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final DraftRepository draftRepository;
    private final MemberRepository memberRepository;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final LobbyWebSocketService lobbyWebSocketService;

    /**
     * 드래프트 방 생성
     * 방 생성 후 owner는 자동으로 OBSERVER로 로비에 참가
     */
    @Transactional
    public RoomCreateRes createRoom(RoomCreateReq req, Member owner) {
        int startPrice = req.getStartPrice() != null ? req.getStartPrice() : 100;
        int startPoint = req.getStartPoint() != null ? req.getStartPoint() : 1000;
        int maxTeamCount = req.getMaxTeamCount() != null ? req.getMaxTeamCount() : 2;

        if (startPrice > startPoint) {
            throw new CustomException(ErrorType.DRAFT_START_PRICE_INVALID);
        }

        Draft draft = Draft.builder()
                .owner(owner)
                .title(req.getTitle())
                .startPrice(startPrice)
                .startPoint(startPoint)
                .maxTeamCount(maxTeamCount)
                .build();

        draftRepository.save(draft);

        // 방 생성자(owner)를 자동으로 OBSERVER로 로비에 참가
        LobbyParticipant ownerParticipant = LobbyParticipant.builder()
                .memberId(owner.getId())
                .gameName(owner.getGameName())
                .role("MEMBER") // 방장은 기본적으로 MEMBER 역할
                .position(Position.OBSERVER)
                .isReady(false)
                .build();

        lobbyRedisRepository.join(draft.getId(), ownerParticipant);

        return RoomCreateRes.builder()
                .draftId(draft.getId())
                .teamMemberCode(draft.getMemberCode())
                .teamLeaderCode(draft.getLeaderCode())
                .build();
    }

    /**
     * 드래프트 방 참가
     */
    @Transactional
    public Long joinRoom(RoomJoinReq req, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));

        // 1. Try to find by Member Code (Candidate)
        Draft draftAsMember = draftRepository.findByMemberCode(req.getDraftCode()).orElse(null);
        if (draftAsMember != null) {
            joinToLobby(draftAsMember.getId(), member, req, "MEMBER");
            return draftAsMember.getId();
        }

        // 2. Try to find by Leader Code (Team Leader)
        Draft draftAsLeader = draftRepository.findByLeaderCode(req.getDraftCode()).orElse(null);
        if (draftAsLeader != null) {
            joinToLobby(draftAsLeader.getId(), member, req, "LEADER");
            return draftAsLeader.getId();
        }

        throw new CustomException(ErrorType.INVALID_DRAFT_CODE);
    }

    private void joinToLobby(Long draftId, Member member, RoomJoinReq req, String role) {
        if (lobbyRedisRepository.isParticipating(draftId, member.getId())) {
            throw new CustomException(ErrorType.ALREADY_PARTICIPATING);
        }

        // position이 null이면 OBSERVER를 기본값으로 사용
        Position selectedPosition =
                req.getPosition() != null ? req.getPosition() : Position.OBSERVER;

        LobbyParticipant participant = LobbyParticipant.builder()
                .memberId(member.getId())
                .gameName(member.getGameName())
                .role(role)
                .position(selectedPosition)
                .isReady(false)
                .build();

        lobbyRedisRepository.join(draftId, participant);

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.PARTICIPANT_JOINED);
    }

    /**
     * 드래프트 목록 조회
     */
    public List<DraftListRes> getDraftList() {
        List<Draft> drafts = draftRepository.findAll();

        return drafts.stream()
                .map(draft -> {
                    List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draft.getId());

                    return DraftListRes.builder()
                            .draftId(draft.getId())
                            .title(draft.getTitle())
                            .ownerName(draft.getOwner().getGameName())
                            .maxTeamCount(draft.getMaxTeamCount())
                            .participantCount(participants.size())
                            .status(draft.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 드래프트 정보 수정 (관리자 전용)
     */
    @Transactional
    public void updateDraftInfo(Long draftId, UpdateDraftInfoReq req, Long adminId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 관리자 권한 확인
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_ADMIN_ONLY, "관리자만 드래프트 정보를 수정할 수 있습니다.");
        }

        // 로비 상태가 아니면 수정 불가
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 드래프트 정보를 수정할 수 있습니다.");
        }

        // 시작 가격과 시작 포인트 검증 (둘 다 null이 아닌 경우)
        Integer finalStartPrice = req.getStartPrice() != null ? req.getStartPrice() : draft.getStartPrice();
        Integer finalStartPoint = req.getStartPoint() != null ? req.getStartPoint() : draft.getStartPoint();

        if (finalStartPrice > finalStartPoint) {
            throw new CustomException(ErrorType.DRAFT_START_PRICE_INVALID);
        }

        // 드래프트 정보 업데이트 (null이 아닌 값만 업데이트됨)
        draft.updateDraftInfo(
                req.getTitle(),
                req.getStartPrice(),
                req.getStartPoint(),
                req.getMaxTeamCount()
        );

        draftRepository.save(draft);

        // WebSocket 브로드캐스트 - 드래프트 정보 변경 알림
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.REFRESH_REQUIRED);
    }
}
