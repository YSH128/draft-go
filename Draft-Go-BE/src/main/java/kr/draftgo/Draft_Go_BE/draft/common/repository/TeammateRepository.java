package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeammateRepository extends JpaRepository<Teammate, Long> {
    List<Teammate> findByTeamId(Long teamId);

    Optional<Teammate> findByTeamIdAndIsLeaderTrue(Long teamId);

    /**
     * 팀이 특정 포지션의 선수를 보유하고 있는지 확인
     */
    boolean existsByTeamIdAndPosition(Long teamId, Position position);

    default void add(Long memberId, Long teamId) {
        // Impl later
    }
}
