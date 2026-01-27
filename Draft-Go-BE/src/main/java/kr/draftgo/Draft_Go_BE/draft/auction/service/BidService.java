package kr.draftgo.Draft_Go_BE.draft.auction.service;

import kr.draftgo.Draft_Go_BE.draft.auction.controller.BidRequest;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.AuctionKey;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.BidLuaExecutor;
import kr.draftgo.Draft_Go_BE.draft.auction.redis.RedisAuctionRepository;
import kr.draftgo.Draft_Go_BE.draft.auction.websocket.AuctionEventPublisher;
// Correct package based on search result

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidLuaExecutor luaExecutor;
    private final RedisAuctionRepository redisRepo;
    private final AuctionEventPublisher publisher;

    public void placeBid(Long draftId, Long leaderId, BidRequest req) {

        // 가격 검증 (0 이하 불가)
        if (req.price() <= 0) {
            throw new IllegalArgumentException("Bid price must be positive");
        }

        // 팀 포인트 사전 검증 (빠른 실패)
        // Redis에서 포인트 확인
        Integer currentPoint = redisRepo.getTeamPoint(draftId, req.teamId());
        if (currentPoint < req.price()) {
            throw new InsufficientPointException();
        }

        luaExecutor.tryBid(
                AuctionKey.bid(draftId),
                AuctionKey.timer(draftId),
                req.teamId(),
                leaderId,
                req.price());

        // 입찰 후 남은 시간 조회 (타이머가 30초로 리셋되었으므로)
        Integer remainingSeconds = redisRepo.getRemainingTime(draftId);

        publisher.bidUpdated(draftId, req.teamId(), req.price(), remainingSeconds);
    }
}
