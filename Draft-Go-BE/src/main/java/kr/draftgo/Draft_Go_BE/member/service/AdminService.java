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
     * 특정 드래프트에 test 멤버를 로비에 입장시킴
     * 이미 참가 중인 멤버는 건너뜀
     *
     * @param draftId 드래프트 ID
     * @param count 추가할 멤버 수 (1~30, 기본값 10)
     * @return 추가된 멤버 username 리스트
     */
    @Transactional
    public List<String> addTestMembersToLobby(Long draftId, Integer count) {
        // count 검증 및 기본값 설정
        if (count == null) {
            count = 10;
        }
        if (count < 1 || count > 30) {
            throw new IllegalArgumentException("count must be between 1 and 30");
        }

        // 드래프트 조회
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 드래프트가 로비 상태인지 확인
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 멤버를 추가할 수 있습니다.");
        }

        List<String> addedMembers = new ArrayList<>();
        List<String> skippedMembers = new ArrayList<>();

        // 포지션 순환 배열 (5개씩)
        Position[] positions = { Position.TOP, Position.JUNGLE, Position.MID, Position.BOT, Position.SUP };

        // test1~test{count} 멤버를 순회하며 로비에 추가
        for (int i = 1; i <= count; i++) {
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

            // 포지션 할당 (5개씩 순환: test1=TOP, test2=JUNGLE, test3=MID, test4=BOT, test5=SUP, test6=TOP, ...)
            Position position = positions[(i - 1) % 5];

            // 로비에 참가자 추가
            LobbyParticipant participant = LobbyParticipant.builder()
                    .memberId(member.getId())
                    .gameName(member.getGameName())
                    .role("MEMBER")
                    .position(position)
                    .isReady(false)
                    .build();

            lobbyRedisRepository.join(draftId, participant);
            addedMembers.add(username);
            log.info("Added member {} to draft {} with position {}", username, draftId, position);
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

    /**
     * 모든 팀장을 준비 완료 상태로 변경 (관리자 전용)
     *
     * @param draftId 드래프트 ID
     * @return 준비 완료로 변경된 팀장 수
     */
    @Transactional
    public int setAllLeadersReady(Long draftId) {
        // 드래프트 조회
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new CustomException(ErrorType.DRAFT_NOT_FOUND));

        // 드래프트가 로비 상태인지 확인
        if (draft.getStatus() != DraftStatus.LOBBY) {
            throw new CustomException(ErrorType.DRAFT_NOT_IN_LOBBY, "로비 상태에서만 팀장을 준비 완료 상태로 변경할 수 있습니다.");
        }

        // 모든 참가자 조회
        List<LobbyParticipant> participants = lobbyRedisRepository.getParticipants(draftId);

        // 팀장만 필터링
        List<LobbyParticipant> leaders = participants.stream()
                .filter(p -> "LEADER".equals(p.getRole()))
                .toList();

        if (leaders.isEmpty()) {
            throw new CustomException(ErrorType.NO_LEADERS, "준비 상태로 변경할 팀장이 없습니다.");
        }

        // 모든 팀장을 준비 완료 상태로 변경
        int readyCount = 0;
        for (LobbyParticipant leader : leaders) {
            if (!leader.isReady()) {
                lobbyRedisRepository.toggleReady(draftId, leader.getMemberId(), true);
                readyCount++;
                log.info("Set leader ready: draftId={}, leaderId={}, gameName={}",
                        draftId, leader.getMemberId(), leader.getGameName());
            }
        }

        // WebSocket 브로드캐스트
        if (readyCount > 0) {
            lobbyWebSocketService.broadcastLobbyUpdate(draftId, LobbyEventType.READY_STATUS_CHANGED);

            // 채팅 시스템 메시지
            chatWebSocketController.sendSystemMessage(draftId,
                    "관리자가 모든 팀장을 준비 완료 상태로 변경했습니다. (" + readyCount + "명)");
        }

        log.info("All leaders set to ready: draftId={}, count={}", draftId, readyCount);

        return readyCount;
    }
}
