package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DraftRepository extends JpaRepository<Draft, Long> {
    Optional<Draft> findByMemberCode(String memberCode);
    Optional<Draft> findByLeaderCode(String leaderCode);
}
