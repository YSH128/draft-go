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
                riotApiService.refreshMatches(event.getMember())
                                .subscribe(
                                                result -> log.info("Async match fetch completed for {}: {}",
                                                                event.getMember().getUsername(),
                                                                result),
                                                error -> log.error("Async match fetch failed for {}",
                                                                event.getMember().getUsername(), error));
        }
}
