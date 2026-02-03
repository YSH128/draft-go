package kr.draftgo.Draft_Go_BE.draft.common.repository;

import jakarta.persistence.LockModeType;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DraftRepository extends JpaRepository<Draft, Long> {
       Optional<Draft> findByMemberCode(String memberCode);

       Optional<Draft> findByLeaderCode(String leaderCode);

       List<Draft> findAllByStatus(DraftStatus status);

       /**
        * 비관적 락을 사용하여 Draft 조회 (동시성 제어용)
        * SELECT FOR UPDATE를 통해 트랜잭션 동안 해당 row를 잠금
        */
       @Lock(LockModeType.PESSIMISTIC_WRITE)
       @Query("SELECT d FROM Draft d WHERE d.id = :id")
       Optional<Draft> findByIdWithLock(@Param("id") Long id);

       @Query("SELECT d FROM Draft d JOIN FETCH d.owner ORDER BY d.createdAt DESC")
       List<Draft> findAllWithOwner();

       @Query("SELECT d FROM Draft d JOIN FETCH d.owner WHERE d.status = :status ORDER BY d.createdAt DESC")
       List<Draft> findAllByStatusWithOwner(@Param("status") DraftStatus status);

       @Query("SELECT DISTINCT d FROM Draft d JOIN FETCH d.owner " +
                     "WHERE d.id IN (SELECT dm.draft.id FROM DraftMember dm WHERE dm.member.id = :memberId) " +
                     "ORDER BY d.createdAt DESC")
       List<Draft> findAllByMemberIdWithOwner(@Param("memberId") Long memberId);

       @Query("SELECT DISTINCT d FROM Draft d JOIN FETCH d.owner " +
                     "WHERE d.status = :status AND d.id IN (SELECT dm.draft.id FROM DraftMember dm WHERE dm.member.id = :memberId) "
                     +
                     "ORDER BY d.createdAt DESC")
       List<Draft> findAllByStatusAndMemberIdWithOwner(@Param("status") DraftStatus status,
                     @Param("memberId") Long memberId);
}
