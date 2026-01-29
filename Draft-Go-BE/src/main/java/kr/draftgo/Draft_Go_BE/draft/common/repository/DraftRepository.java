package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DraftRepository extends JpaRepository<Draft, Long> {
    Optional<Draft> findByMemberCode(String memberCode);
    Optional<Draft> findByLeaderCode(String leaderCode);
    List<Draft> findAllByStatus(DraftStatus status);

    @Query("SELECT d FROM Draft d JOIN FETCH d.owner ORDER BY d.createdAt DESC")
    List<Draft> findAllWithOwner();

    @Query("SELECT d FROM Draft d JOIN FETCH d.owner WHERE d.status = :status ORDER BY d.createdAt DESC")
    List<Draft> findAllByStatusWithOwner(@Param("status") DraftStatus status);

    @Query("SELECT DISTINCT d FROM Draft d JOIN FETCH d.owner " +
           "WHERE d.id IN (SELECT dm.draft.id FROM DraftMember dm WHERE dm.member.id = :memberId) " +
           "ORDER BY d.createdAt DESC")
    List<Draft> findAllByMemberIdWithOwner(@Param("memberId") Long memberId);

    @Query("SELECT DISTINCT d FROM Draft d JOIN FETCH d.owner " +
           "WHERE d.status = :status AND d.id IN (SELECT dm.draft.id FROM DraftMember dm WHERE dm.member.id = :memberId) " +
           "ORDER BY d.createdAt DESC")
    List<Draft> findAllByStatusAndMemberIdWithOwner(@Param("status") DraftStatus status, @Param("memberId") Long memberId);
}
