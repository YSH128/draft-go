package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.draft.chat.websocket.ChatWebSocketController;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.draft.lobby.redis.RedisLobbyRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyEventType;
import kr.draftgo.Draft_Go_BE.draft.lobby.websocket.LobbyWebSocketService;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 전용 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final MemberRepository memberRepository;
    private final DraftRepository draftRepository;
    private final RedisLobbyRepository lobbyRedisRepository;
    private final LobbyWebSocketService lobbyWebSocketService;
    private final ChatWebSocketController chatWebSocketController;

    /**
     * 특정 드래프트에 test1~test10 멤버를 로비에 입장시킴
     * 이미 참가 중인 멤버는 건너뜀
     */
    @Transactional
    public List<String> addTestMembersToLobby(Long draftId) {
        // 드래프트 조회
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 드래프트가 로비 상태인지 확인
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 멤버를 추가할 수 있습니다.");
        }

        List<String> addedMembers = new ArrayList<>();
        List<String> skippedMembers = new ArrayList<>();

        // test1~test10 멤버를 순회하며 로비에 추가
        for (int i = 1; i <= 10; i++) {
            String username = "test" + i;

            // 멤버 조회
            Member member = memberRepository.findByUsername(username).orElse(null);

            if (member == null) {
                log.warn("Member not found: {}", username);
                skippedMembers.add(username + " (존재하지 않음)");
                continue;
            }

            // 이미 참가 중인지 확인
            if (lobbyRedisRepository.isParticipating(draftId, member.getId())) {
                log.info("Member {} already participating in draft {}", username, draftId);
                skippedMembers.add(username + " (이미 참가 중)");
                continue;
            }

            // 로비에 참가자 추가
            LobbyParticipant participant = LobbyParticipant.builder()
                    .memberId(member.getId())
                    .gameName(member.getGameName())
                    .role("MEMBER")
                    .position(Position.OBSERVER)
                    .isReady(false)
                    .build();

            lobbyRedisRepository.join(draftId, participant);
            addedMembers.add(username);
            log.info("Added member {} to draft {}", username, draftId);
        }

        // WebSocket 브로드캐스트 - 로비 업데이트
        if (!addedMembers.isEmpty()) {
            lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.PARTICIPANT_JOINED);

            // 채팅 시스템 메시지
            chatWebSocketController.sendSystemMessage(draftId,
                "테스트 멤버 " + addedMembers.size() + "명이 로비에 입장했습니다.");
        }

        log.info("Test members added to draft {}: added={}, skipped={}",
            draftId, addedMembers.size(), skippedMembers.size());

        return addedMembers;
    }
}
