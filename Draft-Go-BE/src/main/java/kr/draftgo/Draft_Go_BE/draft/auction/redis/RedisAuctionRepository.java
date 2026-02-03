package kr.draftgo.Draft_Go_BE.draft.auction.redis;

import kr.draftgo.Draft_Go_BE.draft.auction.domain.CurrentMemberStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.RoundStatus;
import kr.draftgo.Draft_Go_BE.draft.auction.domain.BidInfo;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.member.domain.Division;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.domain.Tier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisAuctionRepository {

    private final RedisTemplate<String, Object> redis;
    private final StringRedisTemplate stringRedis;

    // setCurrent, setTimer 등은 RoundLuaExecutor 에서 처리
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
                String playerProfileImageUrl = (String) map.get("playerProfileImageUrl");

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

                // Tier 역직렬화
                String tierStr = (String) map.get("tier");
                Tier tier = tierStr != null ? Tier.valueOf(tierStr) : null;

                // Division 역직렬화
                String divisionStr = (String) map.get("division");
                Division division = divisionStr != null ? Division.valueOf(divisionStr) : null;

                // Position 역직렬화
                String positionStr = (String) map.get("position");
                Position position = positionStr != null ? Position.valueOf(positionStr) : null;

                // Main Position 역직렬화
                String mainPositionStr = (String) map.get("mainPosition");
                Position mainPosition = mainPositionStr != null ? Position.valueOf(mainPositionStr) : null;

                // Sub Position 역직렬화
                String subPositionStr = (String) map.get("subPosition");
                Position subPosition = subPositionStr != null ? Position.valueOf(subPositionStr) : null;

                // Most Champions 역직렬화 (List<Map> -> List<MostChampionRes>)
                List<MostChampionRes> mostChampions = null;
                Object championsObj = map.get("mostChampions");
                if (championsObj instanceof List) {
                    List<?> championsList = (List<?>) championsObj;
                    mostChampions = championsList.stream()
                            .filter(item -> item instanceof LinkedHashMap)
                            .map(item -> {
                                LinkedHashMap<String, Object> champMap = (LinkedHashMap<String, Object>) item;
                                return MostChampionRes.builder()
                                        .championId(champMap.get("championId") instanceof Number
                                                ? ((Number) champMap.get("championId")).intValue()
                                                : null)
                                        .championName((String) champMap.get("championName"))
                                        .championIconUrl((String) champMap.get("championIconUrl"))
                                        .totalGames(champMap.get("totalGames") instanceof Number
                                                ? ((Number) champMap.get("totalGames")).intValue()
                                                : 0)
                                        .totalWins(champMap.get("totalWins") instanceof Number
                                                ? ((Number) champMap.get("totalWins")).intValue()
                                                : 0)
                                        .totalLosses(champMap.get("totalLosses") instanceof Number
                                                ? ((Number) champMap.get("totalLosses")).intValue()
                                                : 0)
                                        .winRate(champMap.get("winRate") instanceof Number
                                                ? ((Number) champMap.get("winRate")).intValue()
                                                : 0)
                                        .kda(champMap.get("kda") instanceof Number
                                                ? ((Number) champMap.get("kda")).doubleValue()
                                                : 0.0)
                                        .build();
                            })
                            .collect(java.util.stream.Collectors.toList());
                }

                // MinBidPrice 역직렬화
                Integer minBidPrice = map.get("minBidPrice") instanceof Number
                    ? ((Number) map.get("minBidPrice")).intValue()
                    : null;

                return RoundStatus.builder()
                        .draftId(draftIdValue)
                        .playerName(playerName)
                        .playerProfileImageUrl(playerProfileImageUrl)
                        .tier(tier)
                        .division(division)
                        .position(position)
                        .mainPosition(mainPosition)
                        .subPosition(subPosition)
                        .mostChampions(mostChampions)
                        .draftMemberId(draftMemberId)
                        .turnOrder(turnOrder)
                        .currentMemberStatus(currentMemberStatus)
                        .minBidPrice(minBidPrice)
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

    /**
     * 타이머 남은 시간 조회
     * @return 남은 시간 (초). 타이머가 없거나 만료된 경우 0 반환
     */
    public Integer getRemainingSeconds(Long draftId) {
        Long ttl = redis.getExpire(AuctionKey.timer(draftId), TimeUnit.SECONDS);

        // ttl == null: 키가 존재하지 않음 (타이머 없음)
        // ttl == -2: 키가 존재하지 않음 (타이머 만료됨)
        // ttl == -1: 키가 존재하지만 TTL이 설정되지 않음 (이론적으로 불가능)
        // ttl > 0: 남은 시간
        if (ttl == null || ttl < 0) {
            return 0;
        }

        return ttl.intValue();
    }

    /**
     * 타이머가 존재하는지 확인
     * @return true: 타이머가 존재함, false: 타이머가 없거나 만료됨
     */
    public boolean hasTimer(Long draftId) {
        Boolean exists = redis.hasKey(AuctionKey.timer(draftId));
        return exists != null && exists;
    }

    public Integer getTeamPoint(Long draftId, Long teamId) {
        Object val = redis.opsForValue().get(AuctionKey.teamPoint(draftId, teamId));
        if (val == null)
            return null;  // Redis에 값이 없으면 null 반환 (DB 값 사용)
        return (Integer) val;
    }

    public void setTeamPoint(Long draftId, Long teamId, int point) {
        redis.opsForValue().set(AuctionKey.teamPoint(draftId, teamId), point);
    }

    public void deductTeamPoint(Long draftId, Long teamId, int price) {
        redis.opsForValue().decrement(AuctionKey.teamPoint(draftId, teamId), price);
    }

    public void restoreTeamPoint(Long draftId, Long teamId, int price) {
        redis.opsForValue().increment(AuctionKey.teamPoint(draftId, teamId), price);
    }

    /**
     * 팀장 멤버 ID 저장
     */
    public void setTeamLeader(Long draftId, Long teamId, Long leaderMemberId) {
        redis.opsForValue().set(AuctionKey.teamLeader(draftId, teamId), leaderMemberId);
    }

    /**
     * 팀장 멤버 ID 조회
     */
    public Long getTeamLeader(Long draftId, Long teamId) {
        Object val = redis.opsForValue().get(AuctionKey.teamLeader(draftId, teamId));
        if (val == null) {
            return null;
        }
        return val instanceof Number ? ((Number) val).longValue() : null;
    }

    /**
     * 팀이 보유한 포지션 추가
     */
    public void addTeamPosition(Long draftId, Long teamId, String position) {
        redis.opsForSet().add(AuctionKey.teamPositions(draftId, teamId), position);
    }

    /**
     * 팀이 특정 포지션을 보유하고 있는지 확인
     */
    public boolean hasTeamPosition(Long draftId, Long teamId, String position) {
        Boolean result = redis.opsForSet().isMember(AuctionKey.teamPositions(draftId, teamId), position);
        return result != null && result;
    }

    /**
     * 팀의 모든 포지션 삭제 (동기화를 위해)
     */
    public void clearTeamPositions(Long draftId, Long teamId) {
        redis.delete(AuctionKey.teamPositions(draftId, teamId));
    }

    public void clear(Long draftId) {
        redis.delete(List.of(
                AuctionKey.current(draftId),
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId)));
    }
}
