package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DraftMemberRepository extends JpaRepository<DraftMember, Long> {
    Optional<DraftMember> findByDraftIdAndMemberId(Long draftId, Long memberId);

    // Helper for Auction
    Optional<DraftMember> findFirstByDraftIdAndStatusOrderByTurnOrderAsc(Long draftId, DraftMemberStatus status);

    @Query("SELECT dm FROM DraftMember dm WHERE dm.draft.id = :draftId AND dm.status = 'WAITING' ORDER BY dm.turnOrder ASC LIMIT 1")
    Optional<DraftMember> findNextWaiting(@Param("draftId") Long draftId);

    @Query("SELECT dm FROM DraftMember dm WHERE dm.draft.id = :draftId AND dm.status = 'WAITING' ORDER BY dm.turnOrder ASC LIMIT 1")
    Optional<DraftMember> findNextUpcoming(@Param("draftId") Long draftId);

    default void complete(Long draftMemberId) {
        findById(draftMemberId).ifPresent(dm -> {
            dm.complete();
            save(dm);
        });
    }

    default void skip(Long draftMemberId) {
        findById(draftMemberId).ifPresent(dm -> {
            dm.skip();
            save(dm);
        });
    }
}
