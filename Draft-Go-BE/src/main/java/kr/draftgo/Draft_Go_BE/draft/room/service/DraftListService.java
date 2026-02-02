package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.room.dto.DraftListRes;
import kr.draftgo.Draft_Go_BE.match.service.DataDragonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 드래프트 목록 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DraftListService {

    private final DraftRepository draftRepository;
    private final DraftMemberRepository draftMemberRepository;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final DataDragonService dataDragonService;

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

        // 2. Redis에서 참여 중인 LOBBY 드래프트 추가
        addLobbyDraftsFromRedis(draftsFromDb, memberId);

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
            addLobbyDraftsFromRedis(draftsFromDb, memberId);
        }

        return buildDraftListResponse(draftsFromDb, memberId);
    }

    /**
     * Redis에서 참여 중인 LOBBY 드래프트를 목록에 추가 (중복 제거 및 정렬 포함)
     */
    private void addLobbyDraftsFromRedis(List<Draft> drafts, Long memberId) {
        // 1. 모든 LOBBY 상태 드래프트 조회
        List<Draft> lobbyDrafts = draftRepository.findAllByStatusWithOwner(DraftStatus.LOBBY);

        // 2. Redis에서 참여 중이지만 목록에 없는 LOBBY 드래프트 추가
        for (Draft lobbyDraft : lobbyDrafts) {
            boolean alreadyInList = drafts.stream()
                    .anyMatch(d -> d.getId().equals(lobbyDraft.getId()));

            if (!alreadyInList && lobbyRedisRepository.isParticipating(lobbyDraft.getId(), memberId)) {
                drafts.add(lobbyDraft);
            }
        }

        // 3. 생성일시 기준으로 정렬 (최신순)
        drafts.sort((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()));
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
                    boolean isMyParticipant = isParticipating(draft, memberId);

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
     * 사용자가 드래프트에 참여 중인지 확인 (DB 및 Redis 모두 확인)
     */
    private boolean isParticipating(Draft draft, Long memberId) {
        if (memberId == null) {
            return false;
        }

        // 1. DB에서 DraftMember 확인 (드래프트가 시작된 경우)
        boolean isInDb = draftMemberRepository.findByDraft_IdAndMember_Id(draft.getId(), memberId).isPresent();
        if (isInDb) {
            return true;
        }

        // 2. LOBBY 상태인 경우 Redis에서도 확인
        if (draft.getStatus() == DraftStatus.LOBBY) {
            return lobbyRedisRepository.isParticipating(draft.getId(), memberId);
        }

        return false;
    }
}
