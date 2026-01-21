package kr.draftgo.Draft_Go_BE.draft.room.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateReq;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomCreateRes;
import kr.draftgo.Draft_Go_BE.draft.room.dto.RoomJoinReq;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .role("MEMBER")  // 방장은 기본적으로 MEMBER 역할
                .position(kr.draftgo.Draft_Go_BE.member.domain.Position.OBSERVER)
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

        LobbyParticipant participant = LobbyParticipant.builder()
                .memberId(member.getId())
                .gameName(member.getGameName())
                .role(role)
                .position(req.getPosition())
                .isReady(false)
                .build();

        lobbyRedisRepository.join(draftId, participant);
    }
}
