package kr.draftgo.Draft_Go_BE.draft.auction.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BidLuaExecutor {

    private final RedisTemplate<String, Object> redis;
    private final StringRedisTemplate stringRedis;

    /**
     * Lua 스크립트로 입찰 처리
     *
     * @return 1: 성공, -1: 경매 진행 중 아님, -2: 현재 최고가보다 낮음, -3: 입찰 데이터 오류, -4: 최소가보다 낮음
     */
    public int tryBid(
            String bidKey,
            String timerKey,
            Long teamId,
            Long leaderId,
            int price,
            int minBidPrice) {
        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>(LuaScripts.BID, Long.class);
        Long result = stringRedis.execute(
                redisScript,
                List.of(bidKey, timerKey),
                String.valueOf(teamId),
                String.valueOf(leaderId),
                String.valueOf(price),
                "5", // extraTime (5초로 갱신)
                String.valueOf(minBidPrice)
        );
        return result != null ? result.intValue() : -1;
    }
}
