package kr.draftgo.Draft_Go_BE.match.event;

import kr.draftgo.Draft_Go_BE.match.service.MatchService;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.domain.Member;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchEventListener {

        private final MatchService matchService;
        private final RiotApiService riotApiService;

        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleMemberSignupEvent(MemberSignupEvent event) {
                log.info("Async match fetch started for NEW user: {}", event.getMember().getUsername());
                processMatchRefresh(event.getMember());
        }

        /*
         * Login event listener removed or deprecated as per plan, keeping/refactoring
         * for robustness if needed,
         * but user asked to remove login trigger. MemberService login trigger is
         * already removed.
         * We can keep this method but it won't be called by login anymore.
         * Or we can repurpose it. Let's stick to Signup Event.
         */

        private void processMatchRefresh(Member member) {
                try {
                        log.info("Starting orchestrated match refresh for {}", member.getUsername());
                        String result = matchService.refreshMemberData(member.getId());
                        log.info("Orchestrated refresh completed for {}: {}", member.getUsername(), result);
                } catch (Exception e) {
                        log.error("Orchestrated refresh failed for {}", member.getUsername(), e);
                }
        }
}
