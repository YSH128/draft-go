package kr.draftgo.Draft_Go_BE.draft.auction.redis;

public class LuaScripts {

    public static final String BID = """
            local bidKey = KEYS[1]
            local timerKey = KEYS[2]
            local teamId = ARGV[1]
            local leaderId = ARGV[2]
            local price = tonumber(ARGV[3])
            local extraTime = tonumber(ARGV[4])
            local minBidPrice = tonumber(ARGV[5])

            -- 1. 경매 진행 중인지 확인 (타이머 존재 여부)
            if redis.call('EXISTS', timerKey) == 0 then
                return -1 -- Auction not in progress (timer expired)
            end

            -- 2. 현재 입찰 확인
            local currentBid = redis.call('GET', bidKey)
            
            if currentBid then
                -- 입찰이 이미 존재하는 경우: 현재 최고가보다 커야 함
                local status, bidObj = pcall(cjson.decode, currentBid)
                if status and bidObj and bidObj.price then
                    local currentPrice = tonumber(bidObj.price)
                    if price <= currentPrice then
                        return -2 -- Price must be higher than current bid
                    end
                else
                    return -3 -- Invalid bid data (corrupted JSON)
                end
            else
                -- 첫 입찰인 경우: minBidPrice 이상이어야 함
                if price < minBidPrice then
                    return -4 -- Price below minimum bid price
                end
            end

            -- 3. 입찰 갱신 (JSON format matching BidInfo)
            local newBid = cjson.encode({teamId=teamId, price=price})
            redis.call('SET', bidKey, newBid)

            -- 4. 타이머 연장 (남은 시간이 extraTime보다 작으면 extraTime으로 리셋)
            local ttl = redis.call('TTL', timerKey)
            if ttl >= 0 and ttl < extraTime then
                redis.call('EXPIRE', timerKey, extraTime)
            end

            return 1 -- Success
            """;

    /**
     * 라운드 종료 시 상태를 원자적으로 변경하는 Lua 스크립트
     * BIDDING 상태일 때만 COMPLETED 또는 SKIPPED로 변경
     *
     * KEYS[1]: currentKey (auction:{draftId}:current)
     * KEYS[2]: bidKey (auction:{draftId}:bid)
     * KEYS[3]: timerKey (auction:{draftId}:timer)
     *
     * 반환값:
     * - 0: 이미 종료된 라운드 (멱등성 보장)
     * - 1: COMPLETED (입찰 존재)
     * - 2: SKIPPED (입찰 없음)
     */
    public static final String TERMINATE_ROUND = """
            local currentKey = KEYS[1]
            local bidKey = KEYS[2]
            local timerKey = KEYS[3]

            -- 1. 현재 라운드 상태 확인
            local currentState = redis.call('GET', currentKey)
            if not currentState then
                return 0 -- 이미 종료됨
            end

            -- 2. 상태가 BIDDING인지 확인 (멱등성 보장)
            if not string.find(currentState, '"currentMemberStatus":"BIDDING"') then
                return 0 -- 이미 COMPLETED 또는 SKIPPED 상태
            end

            -- 3. 입찰 존재 여부 확인
            local bid = redis.call('GET', bidKey)
            local newStatus
            local result
            
            if bid then
                newStatus = "COMPLETED"
                result = 1
            else
                newStatus = "SKIPPED"
                result = 2
            end

            -- 4. 상태 변경 (currentMemberStatus만 변경)
            local newState = string.gsub(currentState, '"currentMemberStatus":"BIDDING"', '"currentMemberStatus":"' .. newStatus .. '"')
            redis.call('SET', currentKey, newState)

            -- 5. 타이머 삭제 (라운드 종료)
            redis.call('DEL', timerKey)

            return result
            """;

    /**
     * 새 라운드 시작 시 상태를 원자적으로 변경하는 Lua 스크립트
     * COMPLETED 또는 SKIPPED 상태일 때만 새로운 BIDDING 상태로 변경

     * KEYS[1]: currentKey (auction:{draftId}:current)
     * KEYS[2]: timerKey (auction:{draftId}:timer)
     * KEYS[3]: bidKey (auction:{draftId}:bid) - 입찰 정보 초기화를 위해 추가
     * ARGV[1]: newRoundState (JSON string)
     * ARGV[2]: timerSeconds

     * 반환값:
     * - 0: 이미 진행 중인 라운드 (멱등성 보장)
     * - 1: 성공적으로 새 라운드 시작
     */
    public static final String START_ROUND = """
            local currentKey = KEYS[1]
            local timerKey = KEYS[2]
            local bidKey = KEYS[3]
            local newRoundState = ARGV[1]
            local timerSeconds = tonumber(ARGV[2])

            -- 1. 현재 라운드 상태 확인
            local currentState = redis.call('GET', currentKey)
            
            -- 2. 이미 BIDDING 상태이면 시작하지 않음 (멱등성 보장)
            if currentState and string.find(currentState, '"currentMemberStatus":"BIDDING"') then
                return 0
            end

            -- 3. 새 라운드 상태 설정
            redis.call('SET', currentKey, newRoundState)

            -- 4. 이전 입찰 정보 초기화 (중요!)
            redis.call('DEL', bidKey)

            -- 5. 타이머 시작
            redis.call('SET', timerKey, 'RUN')
            redis.call('EXPIRE', timerKey, timerSeconds)

            return 1
            """;
}
