package kr.draftgo.Draft_Go_BE.member.repository;

import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberStatRepository extends JpaRepository<MemberStat, Long> {
    List<MemberStat> findByMember_IdIn(List<Long> memberIds);

    Optional<MemberStat> findByMember_Id(Long memberId);

    Optional<MemberStat> findByMember_IdAndSeasonId(Long memberId, String seasonId);

    /**
     * 특정 시즌의 여러 Member MemberStat을 조회
     */
    @Query("SELECT ms FROM MemberStat ms WHERE ms.member.id IN :memberIds AND ms.seasonId = :seasonId")
    List<MemberStat> findByMember_IdInAndSeasonId(@Param("memberIds") List<Long> memberIds, @Param("seasonId") String seasonId);

    boolean existsByMember_Id(Long memberId);
}
