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

    public void tryBid(
            String bidKey,
            String timerKey,
            Long teamId,
            Long leaderId,
            int price) {
        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>(LuaScripts.BID, Long.class);
        stringRedis.execute(
                redisScript,
                List.of(bidKey, timerKey),
                String.valueOf(teamId),
                String.valueOf(leaderId),
                String.valueOf(price),
                "10" // extraTime
        );
    }
}
