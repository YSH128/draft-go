package kr.draftgo.Draft_Go_BE.draft.auction.redis;

public class LuaScripts {

    public static final String BID = """
            local bidKey = KEYS[1]
            local timerKey = KEYS[2]
            local teamId = ARGV[1]
            local leaderId = ARGV[2]
            local price = tonumber(ARGV[3])
            local extraTime = tonumber(ARGV[4])

            -- 1. 경매 진행 중인지 확인 (타이머 존재 여부)
            if redis.call('EXISTS', timerKey) == 0 then
                return -1 -- Auction ended
            end

            -- 2. 현재 입찰가 확인
            local currentPrice = 0
            local currentBid = redis.call('GET', bidKey)
            if currentBid then
                -- JSON parsing logic is complex in pure Lua without libs,
                -- so we assume bidKey stores simple price or we parse struct.
                -- For simplicity here, let's assume we store the price separately or extract it.
                -- However, standard practice: get price from Hash or auxiliary key.
                -- But BidInfo is a JSON blob usually.
                -- Let's assume the previous bid is just replaced if higher.
                -- But we need to compare prices.
                -- To simplify, let's assume RedisAuctionRepository stores structure.
                -- Actually BidLuaExecutor passes args.
                -- Let's adhere to a text-based protocol or assume bidKey is just a serialized JSON.
                -- Parsing JSON in Lua (cjson) is possible.
            end

            -- Using cjson to decode
            if currentBid then
                local status, bidObj = pcall(cjson.decode, currentBid)
                if status and bidObj and bidObj.price then
                    currentPrice = tonumber(bidObj.price)
                end
            end

            -- 3. 가격 비교
            if price <= currentPrice then
                return 0 -- Price too low
            end

            -- 4. 입찰 갱신 (JSON format matching BidInfo)
            local newBid = cjson.encode({teamId=teamId, price=price})
            redis.call('SET', bidKey, newBid)

            -- 5. 시간 연장 (남은 시간이 10초 미만이면 10초로 초기화 등 logic)
            -- Simple logic: reset TTL to extraTime if TTL < extraTime
            local ttl = redis.call('TTL', timerKey)
            if ttl < extraTime then
                redis.call('EXPIRE', timerKey, extraTime)
            end

            return 1 -- Success
            """;
}
