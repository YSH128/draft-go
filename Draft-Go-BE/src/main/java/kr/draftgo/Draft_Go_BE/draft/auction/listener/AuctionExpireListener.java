package kr.draftgo.Draft_Go_BE.draft.auction.listener;

import kr.draftgo.Draft_Go_BE.draft.auction.service.AuctionResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionExpireListener implements MessageListener {

    private final AuctionResultService auctionResultService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();

        // auction:{draftId}:timer 인지 확인
        if (!expiredKey.contains(":timer")) {
            return;
        }

        Long draftId = extractDraftId(expiredKey);
        auctionResultService.completeAuction(draftId);
    }

    private Long extractDraftId(String key) {
        // auction:12:timer
        String[] parts = key.split(":");
        return Long.parseLong(parts[1]);
    }
}
