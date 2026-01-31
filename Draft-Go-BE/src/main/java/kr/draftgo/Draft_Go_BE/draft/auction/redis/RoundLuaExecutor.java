package kr.draftgo.Draft_Go_BE.draft.auction.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 라운드 시작/종료를 원자적으로 처리하는 Lua 스크립트 실행기
 */
@Component
@RequiredArgsConstructor
public class RoundLuaExecutor {

    private final StringRedisTemplate stringRedis;

    /**
     * 라운드 종료 처리 (원자적)
     *
     * @return 0: 이미 종료됨, 1: COMPLETED, 2: SKIPPED
     */
    public int terminateRound(Long draftId) {
        var script = new DefaultRedisScript<>(LuaScripts.TERMINATE_ROUND, Long.class);

        Long result = stringRedis.execute(
                script,
                List.of(
                        AuctionKey.current(draftId),
                        AuctionKey.bid(draftId),
                        AuctionKey.timer(draftId)
                )
        );

        return result != null ? result.intValue() : 0;
    }

    /**
     * 새 라운드 시작 (원자적)
     * 이전 입찰 정보를 초기화하고 새 라운드 상태와 타이머를 설정합니다.
     *
     * @param newRoundStateJson 새 라운드 상태 JSON
     * @param timerSeconds 타이머 시간 (초)
     * @return 0: 이미 진행 중, 1: 성공
     */
    public int startRound(Long draftId, String newRoundStateJson, int timerSeconds) {
        var script = new DefaultRedisScript<>(LuaScripts.START_ROUND, Long.class);

        Long result = stringRedis.execute(
                script,
                List.of(
                        AuctionKey.current(draftId),
                        AuctionKey.timer(draftId),
                        AuctionKey.bid(draftId)  // 입찰 정보 초기화를 위해 추가
                ),
                newRoundStateJson,
                String.valueOf(timerSeconds)
        );

        return result != null ? result.intValue() : 0;
    }
}
