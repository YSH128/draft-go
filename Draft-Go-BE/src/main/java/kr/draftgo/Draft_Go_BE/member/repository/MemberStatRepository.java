package kr.draftgo.Draft_Go_BE.member.repository;

import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberStatRepository extends JpaRepository<MemberStat, Long> {
    Optional<MemberStat> findByMemberId(Long memberId);
    boolean existsByMemberId(Long memberId);
}
