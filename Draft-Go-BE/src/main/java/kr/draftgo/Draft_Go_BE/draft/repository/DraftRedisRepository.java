package kr.draftgo.Draft_Go_BE.draft.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.draftgo.Draft_Go_BE.draft.dto.DraftParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DraftRedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private String getKey(Long draftId) {
        return "draft:lobby:" + draftId;
    }

    public void join(Long draftId, DraftParticipant participant) {
        String key = getKey(draftId);
        redisTemplate.opsForHash().put(key, participant.getMemberId().toString(), participant);
        redisTemplate.expire(key, Duration.ofHours(24)); // 24hr TTL
    }

    public boolean isParticipating(Long draftId, Long memberId) {
        String key = getKey(draftId);
        return redisTemplate.opsForHash().hasKey(key, memberId.toString());
    }

    public List<DraftParticipant> getParticipants(Long draftId) {
        String key = getKey(draftId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
        return entries.values().stream()
                .map(obj -> objectMapper.convertValue(obj, DraftParticipant.class))
                .collect(Collectors.toList());
    }

    public void exit(Long draftId, Long memberId) {
        String key = getKey(draftId);
        redisTemplate.opsForHash().delete(key, memberId.toString());
    }

    public void clear(Long draftId) {
        String key = getKey(draftId);
        redisTemplate.delete(key);
    }
}
