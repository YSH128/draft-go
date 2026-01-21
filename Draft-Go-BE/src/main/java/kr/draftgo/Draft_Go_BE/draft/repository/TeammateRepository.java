package kr.draftgo.Draft_Go_BE.draft.repository;

import kr.draftgo.Draft_Go_BE.draft.domain.Teammate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeammateRepository extends JpaRepository<Teammate, Long> {
    List<Teammate> findByTeamId(Long teamId);

    Optional<Teammate> findByTeamIdAndIsLeaderTrue(Long teamId);

    default void add(Long memberId, Long teamId) {
        // Impl later
    }
}
