package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.UpdateDraftInfoReq;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 드래프트 생성/수정 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DraftManageService {

    private final DraftRepository draftRepository;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final LobbyWebSocketService lobbyWebSocketService;
    private final ChatWebSocketController chatWebSocketController;

    /**
     * 드래프트 방 생성
     * 방 생성 후 owner는 자동으로 OBSERVER로 로비에 참가
     */
    @Transactional
    public RoomCreateRes createRoom(RoomCreateReq req, Member owner) {
        int startPrice = req.getStartPrice() != null ? req.getStartPrice() : 100;
        int startPoint = req.getStartPoint() != null ? req.getStartPoint() : 1000;
        int maxTeamCount = req.getMaxTeamCount() != null ? req.getMaxTeamCount() : 2;
        String thumbnailUrl = req.getThumbnailUrl() != null ? req.getThumbnailUrl() : "https://picsum.photos/160/90";

        if (startPrice > startPoint) {
            throw new CustomException(ErrorType.DRAFT_START_PRICE_INVALID);
        }

        Draft draft = Draft.builder()
                .owner(owner)
                .title(req.getTitle())
                .startPrice(startPrice)
                .startPoint(startPoint)
                .maxTeamCount(maxTeamCount)
                .thumbnailUrl(thumbnailUrl)
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
     * 드래프트 정보 수정 (관리자 전용)
     */
    @Transactional
    public void updateDraftInfo(Long draftId, UpdateDraftInfoReq req, Long adminId) {
        Draft draft = getDraftByIdOrThrow(draftId);

        validateAdminPermission(draft, adminId);
        validateDraftIsInLobby(draft);
        validateStartPriceAndPoint(req, draft);

        String changedFieldsMessage = buildChangedFieldsMessage(req, draft);

        updateDraft(draft, req);

        notifyDraftInfoChanged(draftId, changedFieldsMessage);
    }

    /**
     * 드래프트 조회 (없으면 예외 발생)
     */
    private Draft getDraftByIdOrThrow(Long draftId) {
        return draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));
    }

    /**
     * 관리자 권한 확인
     */
    private void validateAdminPermission(Draft draft, Long adminId) {
        if (!draft.getOwner().getId().equals(adminId)) {
            throw new CustomException(ErrorType.UNAUTHORIZED_OWNER_ONLY, "관리자만 드래프트 정보를 수정할 수 있습니다.");
        }
    }

    /**
     * 로비 상태 확인
     */
    private void validateDraftIsInLobby(Draft draft) {
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 드래프트 정보를 수정할 수 있습니다.");
        }
    }

    /**
     * 시작 가격과 시작 포인트 검증
     */
    private void validateStartPriceAndPoint(UpdateDraftInfoReq req, Draft draft) {
        Integer finalStartPrice = req.getStartPrice() != null ? req.getStartPrice() : draft.getStartPrice();
        Integer finalStartPoint = req.getStartPoint() != null ? req.getStartPoint() : draft.getStartPoint();

        if (finalStartPrice > finalStartPoint) {
            throw new CustomException(ErrorType.DRAFT_START_PRICE_INVALID);
        }
    }

    /**
     * 변경된 필드 메시지 생성
     */
    private String buildChangedFieldsMessage(UpdateDraftInfoReq req, Draft draft) {
        StringBuilder changedFields = new StringBuilder();

        if (req.getTitle() != null && !req.getTitle().equals(draft.getTitle())) {
            changedFields.append("제목: ").append(draft.getTitle()).append(" → ").append(req.getTitle()).append(", ");
        }
        if (req.getStartPrice() != null && !req.getStartPrice().equals(draft.getStartPrice())) {
            changedFields.append("시작 가격: ").append(draft.getStartPrice()).append(" → ").append(req.getStartPrice()).append(", ");
        }
        if (req.getStartPoint() != null && !req.getStartPoint().equals(draft.getStartPoint())) {
            changedFields.append("시작 포인트: ").append(draft.getStartPoint()).append(" → ").append(req.getStartPoint()).append(", ");
        }
        if (req.getMaxTeamCount() != null && !req.getMaxTeamCount().equals(draft.getMaxTeamCount())) {
            changedFields.append("최대 팀 수: ").append(draft.getMaxTeamCount()).append(" → ").append(req.getMaxTeamCount()).append(", ");
        }
        if (req.getThumbnailUrl() != null && !req.getThumbnailUrl().equals(draft.getThumbnailUrl())) {
            changedFields.append("썸네일 URL 변경됨, ");
        }

        // 마지막 ", " 제거
        if (!changedFields.isEmpty()) {
            changedFields.setLength(changedFields.length() - 2);
        }

        return changedFields.toString();
    }

    /**
     * 드래프트 정보 업데이트
     */
    private void updateDraft(Draft draft, UpdateDraftInfoReq req) {
        // 드래프트 정보 업데이트 (null이 아닌 값만 업데이트됨)
        draft.updateDraftInfo(
                req.getTitle(),
                req.getStartPrice(),
                req.getStartPoint(),
                req.getMaxTeamCount()
        );

        // 썸네일 URL은 별도로 업데이트 (null 허용)
        if (req.getThumbnailUrl() != null) {
            draft.updateThumbnailUrl(req.getThumbnailUrl());
        }

        draftRepository.save(draft);
    }

    /**
     * 드래프트 정보 변경 알림
     */
    private void notifyDraftInfoChanged(Long draftId, String changedFieldsMessage) {
        // WebSocket 브로드캐스트 - 드래프트 정보 변경 알림
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.REFRESH_REQUIRED);

        // 채팅 시스템 메시지 - 변경된 정보 상세 표시
        if (!changedFieldsMessage.isEmpty()) {
            chatWebSocketController.sendSystemMessage(draftId, "드래프트 정보가 변경되었습니다. (" + changedFieldsMessage + ")");
        }
    }
}
