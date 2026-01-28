package kr.draftgo.Draft_Go_BE.draft.auction.redis;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.CurrentMemberStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisAuctionRepository {

    private final RedisTemplate<String, Object> redis;
    private final StringRedisTemplate stringRedis;

    public void setCurrent(Long draftId, RoundStatus state) {
        redis.opsForValue().set(AuctionKey.current(draftId), state);
    }

    public RoundStatus getCurrent(Long draftId) {
        Object result = redis.opsForValue().get(AuctionKey.current(draftId));

        if (result == null) {
            return null;
        }

        // Redis deserializes as LinkedHashMap, manually parse it
        if (result instanceof LinkedHashMap) {
            LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) result;

            try {
                Long draftIdValue = map.get("draftId") instanceof Number
                    ? ((Number) map.get("draftId")).longValue()
                    : null;

                String playerName = (String) map.get("playerName");

                Long draftMemberId = map.get("draftMemberId") instanceof Number
                    ? ((Number) map.get("draftMemberId")).longValue()
                    : null;

                int turnOrder = map.get("turnOrder") instanceof Number
                    ? ((Number) map.get("turnOrder")).intValue()
                    : 0;

                String statusStr = (String) map.get("currentMemberStatus");
                CurrentMemberStatus currentMemberStatus = statusStr != null
                    ? CurrentMemberStatus.valueOf(statusStr)
                    : null;

                // Parse LocalDateTime
                LocalDateTime startedAt = null;
                Object startedAtObj = map.get("startedAt");
                if (startedAtObj instanceof String) {
                    startedAt = LocalDateTime.parse((String) startedAtObj,
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } else if (startedAtObj instanceof LocalDateTime) {
                    startedAt = (LocalDateTime) startedAtObj;
                }

                return RoundStatus.builder()
                    .draftId(draftIdValue)
                    .playerName(playerName)
                    .draftMemberId(draftMemberId)
                    .turnOrder(turnOrder)
                    .currentMemberStatus(currentMemberStatus)
                    .startedAt(startedAt)
                    .build();

            } catch (Exception e) {
                throw new RuntimeException("Failed to parse RoundStatus from Redis: " + e.getMessage(), e);
            }
        }

        // If it's already RoundStatus (shouldn't happen, but just in case)
        return (RoundStatus) result;
    }

    public BidInfo getBid(Long draftId) {
        String json = stringRedis.opsForValue().get(AuctionKey.bid(draftId));
        if (json == null)
            return BidInfo.builder().build(); // Return empty if null

        // Manual JSON Parsing (Simple)
        try {
            // Remove braces and quotes
            String clean = json.replace("{", "").replace("}", "").replace("\"", "");
            String[] parts = clean.split(",");

            Long teamId = null;
            int price = 0;

            for (String part : parts) {
                String[] kv = part.split(":");
                String key = kv[0].trim();
                String val = kv[1].trim();
                if ("teamId".equals(key))
                    teamId = Long.parseLong(val);
                if ("price".equals(key))
                    price = Integer.parseInt(val);
            }
            return BidInfo.builder().teamId(teamId).price(price).build();

        } catch (Exception e) {
            return BidInfo.builder().build();
        }
    }

    public void startTimer(Long draftId, int seconds) {
        redis.opsForValue().set(AuctionKey.timer(draftId), "RUN");
        redis.expire(AuctionKey.timer(draftId), seconds, TimeUnit.SECONDS);
    }

    public Integer getRemainingTime(Long draftId) {
        Long ttl = redis.getExpire(AuctionKey.timer(draftId), TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl.intValue() : 0;
    }

    public void setTeamPoint(Long draftId, Long teamId, int point) {
        redis.opsForValue().set(AuctionKey.teamPoint(draftId, teamId), point);
    }

    public Integer getTeamPoint(Long draftId, Long teamId) {
        Object val = redis.opsForValue().get(AuctionKey.teamPoint(draftId, teamId));
        if (val == null)
            return 0;
        return (Integer) val;
    }

    public void deductTeamPoint(Long draftId, Long teamId, int price) {
        redis.opsForValue().decrement(AuctionKey.teamPoint(draftId, teamId), price);
    }

    public void clear(Long draftId) {
        redis.delete(List.of(
                AuctionKey.current(draftId),
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId)));
    }
}
