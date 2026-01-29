package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.room.dto.DraftListRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.UpdateDraftInfoReq;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
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
    private final RedisLobbyRepository lobbyRedisRepository;
    private final LobbyWebSocketService lobbyWebSocketService;
    private final ChatWebSocketController chatWebSocketController;
    private final DataDragonService dataDragonService;
    private final DraftMemberRepository draftMemberRepository;

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
            throw new CustomException(ErrorType.UNAUTHORIZED_ADMIN_ONLY, "관리자만 방 ID로 참가할 수 있습니다.");
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

        // WebSocket 브로드캐스트
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.PARTICIPANT_JOINED);

        // 채팅 입장 알림
        chatWebSocketController.sendJoinMessage(draftId, member.getNickname());
    }

    /**
     * 드래프트 목록 조회
     */
    public List<DraftListRes> getDraftList(Long memberId) {
        List<Draft> drafts = draftRepository.findAllWithOwner();
        return buildDraftListResponse(drafts, memberId);
    }

    /**
     * 드래프트 목록 조회 (상태 필터링)
     */
    public List<DraftListRes> getDraftListByStatus(DraftStatus status, Long memberId) {
        List<Draft> drafts = draftRepository.findAllByStatusWithOwner(status);
        return buildDraftListResponse(drafts, memberId);
    }

    /**
     * 드래프트 목록 조회 (사용자 참여 필터링)
     */
    public List<DraftListRes> getDraftListByMemberId(Long memberId) {
        // 1. DB에서 DraftMember로 참여 중인 드래프트 조회
        List<Draft> draftsFromDb = draftRepository.findAllByMemberIdWithOwner(memberId);

        // 2. 모든 LOBBY 상태 드래프트 조회하여 Redis에서 참여 여부 확인
        List<Draft> lobbyDrafts = draftRepository.findAllByStatusWithOwner(DraftStatus.LOBBY);

        // 3. Redis에서 참여 중이지만 DB에는 없는 LOBBY 드래프트 추가
        for (Draft lobbyDraft : lobbyDrafts) {
            boolean alreadyInList = draftsFromDb.stream()
                    .anyMatch(d -> d.getId().equals(lobbyDraft.getId()));

            if (!alreadyInList && lobbyRedisRepository.isParticipating(lobbyDraft.getId(), memberId)) {
                draftsFromDb.add(lobbyDraft);
            }
        }

        // 4. 생성일시 기준으로 정렬 (최신순)
        draftsFromDb.sort((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()));

        return buildDraftListResponse(draftsFromDb, memberId);
    }

    /**
     * 드래프트 목록 조회 (상태 및 사용자 참여 필터링)
     */
    public List<DraftListRes> getDraftListByStatusAndMemberId(DraftStatus status, Long memberId) {
        // 1. DB에서 DraftMember로 참여 중인 드래프트 조회
        List<Draft> draftsFromDb = draftRepository.findAllByStatusAndMemberIdWithOwner(status, memberId);

        // 2. LOBBY 상태 필터링인 경우 Redis에서도 확인
        if (status == DraftStatus.LOBBY) {
            List<Draft> lobbyDrafts = draftRepository.findAllByStatusWithOwner(DraftStatus.LOBBY);

            // Redis에서 참여 중이지만 DB에는 없는 LOBBY 드래프트 추가
            for (Draft lobbyDraft : lobbyDrafts) {
                boolean alreadyInList = draftsFromDb.stream()
                        .anyMatch(d -> d.getId().equals(lobbyDraft.getId()));

                if (!alreadyInList && lobbyRedisRepository.isParticipating(lobbyDraft.getId(), memberId)) {
                    draftsFromDb.add(lobbyDraft);
                }
            }

            // 생성일시 기준으로 정렬 (최신순)
            draftsFromDb.sort((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()));
        }

        return buildDraftListResponse(draftsFromDb, memberId);
    }

    /**
     * Draft 리스트를 DraftListRes로 변환
     */
    private List<DraftListRes> buildDraftListResponse(List<Draft> drafts, Long memberId) {
        return drafts.stream()
                .map(draft -> {
                    List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draft.getId());

                    // Owner의 profileIconId를 사용하여 프로필 이미지 URL 생성
                    String ownerProfileImageUrl = null;
                    if (draft.getOwner().getProfileIconId() != null) {
                        ownerProfileImageUrl = dataDragonService.getProfileIconUrl(draft.getOwner().getProfileIconId());
                    }

                    // 현재 사용자의 참여 여부 확인 (비로그인 시 false)
                    boolean isMyParticipant = false;
                    if (memberId != null) {
                        // 1. DB에서 DraftMember 확인 (드래프트가 시작된 경우)
                        isMyParticipant = draftMemberRepository.findByDraftIdAndMemberId(draft.getId(), memberId).isPresent();

                        // 2. LOBBY 상태인 경우 Redis에서도 확인
                        if (!isMyParticipant && draft.getStatus() == DraftStatus.LOBBY) {
                            isMyParticipant = lobbyRedisRepository.isParticipating(draft.getId(), memberId);
                        }
                    }

                    return DraftListRes.builder()
                            .draftId(draft.getId())
                            .title(draft.getTitle())
                            .ownerName(draft.getOwner().getGameName())
                            .ownerProfileImage(ownerProfileImageUrl)
                            .thumbnailUrl(draft.getThumbnailUrl())
                            .maxTeamCount(draft.getMaxTeamCount())
                            .participantCount(participants.size())
                            .status(draft.getStatus())
                            .createdAt(draft.getCreatedAt())
                            .myParticipant(isMyParticipant)
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

        // 변경된 정보를 추적하기 위한 리스트
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

        // WebSocket 브로드캐스트 - 드래프트 정보 변경 알림
        lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.REFRESH_REQUIRED);

        // 채팅 시스템 메시지 - 변경된 정보 상세 표시
        if (!changedFields.isEmpty()) {
            // 마지막 ", " 제거
            changedFields.setLength(changedFields.length() - 2);
            chatWebSocketController.sendSystemMessage(draftId, "드래프트 정보가 변경되었습니다. (" + changedFields + ")");
        }
    }
}
