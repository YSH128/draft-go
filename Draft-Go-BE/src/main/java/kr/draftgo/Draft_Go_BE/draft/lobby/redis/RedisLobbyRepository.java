package kr.draftgo.Draft_Go_BE.draft.lobby.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class RedisLobbyRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private String getKey(Long draftId) {
        return "draft:lobby:" + draftId;
    }

    public void join(Long draftId, LobbyParticipant participant) {
        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, participant.getMemberId().toString(), participant);
        redisTemplate.expire(key, Duration.ofHours(24)); // 24hr TTL
    }

    public boolean isParticipating(Long draftId, Long memberId) {
        String key = getKey(draftId);
        return redisTemplate.opsForHash().hasKey(key, memberId.toString());
    }

    public List<LobbyParticipant> getParticipants(Long draftId) {
        String key = getKey(draftId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
        return entries.values().stream()
                .map(obj -> objectMapper.convertValue(obj, LobbyParticipant.class))
                .collect(Collectors.toList());
    }

    public LobbyParticipant getParticipant(Long draftId, Long memberId) {
        String key = getKey(draftId);
        Object obj = redisTemplate.opsForHash().get(key, memberId.toString());
        if (obj == null) {
            return null;
        }
        return objectMapper.convertValue(obj, LobbyParticipant.class);
    }

    public void exit(Long draftId, Long memberId) {
        String key = getKey(draftId);
        redisTemplate.opsForHash().delete(key, memberId.toString());
    }

    public void clear(Long draftId) {
        String key = getKey(draftId);
        redisTemplate.delete(key);
    }

    /**
     * 역할 변경
     */
    public void changeRole(Long draftId, Long memberId, String newRole) {
        LobbyParticipant participant = getParticipant(draftId, memberId);
        if (participant == null) {
            throw new CustomException(ErrorType.PARTICIPANT_NOT_FOUND);
        }

        // LEADER로 변경 시 기존 포인트 유지 (없으면 0), MEMBER로 변경 시 0으로 초기화
        Integer leaderPoint = "LEADER".equals(newRole)
                ? (participant.getLeaderPoint() != null ? participant.getLeaderPoint() : 0)
                : 0;

        LobbyParticipant updated = LobbyParticipant.builder()
                .memberId(participant.getMemberId())
                .gameName(participant.getGameName())
                .role(newRole)
                .position(participant.getPosition())
                .isReady(false) // 역할 변경 시 준비 상태 초기화
                .leaderPoint(leaderPoint)
                .build();

        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, memberId.toString(), updated);
    }

    /**
     * 포지션 변경
     */
    public void changePosition(Long draftId, Long memberId, Position newPosition) {
        LobbyParticipant participant = getParticipant(draftId, memberId);
        if (participant == null) {
            throw new CustomException(ErrorType.PARTICIPANT_NOT_FOUND);
        }

        LobbyParticipant updated = LobbyParticipant.builder()
                .memberId(participant.getMemberId())
                .gameName(participant.getGameName())
                .role(participant.getRole())
                .position(newPosition)
                .isReady(participant.isReady())
                .leaderPoint(participant.getLeaderPoint())
                .build();

        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, memberId.toString(), updated);
    }

    /**
     * 준비 상태 토글
     */
    public void toggleReady(Long draftId, Long memberId, Boolean isReady) {
        LobbyParticipant participant = getParticipant(draftId, memberId);
        if (participant == null) {
            throw new CustomException(ErrorType.PARTICIPANT_NOT_FOUND);
        }

        LobbyParticipant updated = LobbyParticipant.builder()
                .memberId(participant.getMemberId())
                .gameName(participant.getGameName())
                .role(participant.getRole())
                .position(participant.getPosition())
                .isReady(isReady)
                .leaderPoint(participant.getLeaderPoint())
                .build();

        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, memberId.toString(), updated);
    }

    /**
     * 참가자 제거 (강제 퇴장)
     */
    public void removeParticipant(Long draftId, Long memberId) {
        exit(draftId, memberId);
    }

    /**
     * 팀장 포인트 설정 (관리자 전용)
     */
    public void setLeaderPoint(Long draftId, Long leaderId, Integer point) {
        LobbyParticipant participant = getParticipant(draftId, leaderId);
        if (participant == null) {
            throw new CustomException(ErrorType.PARTICIPANT_NOT_FOUND);
        }

        if (!"LEADER".equals(participant.getRole())) {
            throw new CustomException(ErrorType.UNAUTHORIZED_LEADER_ONLY, "팀장만 포인트를 설정할 수 있습니다.");
        }

        LobbyParticipant updated = LobbyParticipant.builder()
                .memberId(participant.getMemberId())
                .gameName(participant.getGameName())
                .role(participant.getRole())
                .position(participant.getPosition())
                .isReady(participant.isReady())
                .leaderPoint(point)
                .build();

        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, leaderId.toString(), updated);
    }
}
