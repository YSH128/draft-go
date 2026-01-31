package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    /**
     * 비관적 락을 적용하여 Team 조회
     * 동시성 제어를 위해 SELECT ... FOR UPDATE 실행
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findByIdWithLock(@Param("id") Long id);

    List<Team> findAllByDraftId(Long draftId);
}
