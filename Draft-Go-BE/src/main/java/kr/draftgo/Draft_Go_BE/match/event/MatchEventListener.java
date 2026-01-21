package kr.draftgo.Draft_Go_BE.match.event;

import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchEventListener {

        private final MemberService memberService; // Added dependency
        private final RiotApiService riotApiService;

        @Async
        @EventListener
        public void handleMemberSignupEvent(kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent event) {
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

        private void processMatchRefresh(kr.draftgo.Draft_Go_BE.member.domain.Member member) {
                try {
                        String result = riotApiService.refreshMatches(member);
                        log.info("Async match fetch completed for {}: {}", member.getUsername(), result);

                        // Feature 2: Auto-Positioning
                        if (member.getMainPosition() == null) {
                                memberService.analyzeAndSetPositions(member);
                        }

                        // Feature 3 Extension: Update Stats (Rank, LP, etc.) on Signup/Refresh
                        memberService.updateMemberStats(member.getId());

                } catch (Exception e) {
                        log.error("Async match fetch failed for {}", member.getUsername(), e);
                }
        }
}
