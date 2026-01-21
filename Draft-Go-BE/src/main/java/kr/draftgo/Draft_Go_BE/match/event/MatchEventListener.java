package kr.draftgo.Draft_Go_BE.match.event;

import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchEventListener {

        private final RiotApiService riotApiService;

        @Async
        @EventListener
        public void handleMemberLoginEvent(kr.draftgo.Draft_Go_BE.member.event.MemberLoginEvent event) {
                log.info("Async match fetch started for user: {}", event.getMember().getUsername());
                try {
                        String result = riotApiService.refreshMatches(event.getMember());
                        log.info("Async match fetch completed for {}: {}",
                                        event.getMember().getUsername(),
                                        result);
                } catch (Exception e) {
                        log.error("Async match fetch failed for {}",
                                        event.getMember().getUsername(), e);
                }
        }
}
