package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DraftMemberRepository extends JpaRepository<DraftMember, Long> {
    Optional<DraftMember> findByDraftIdAndMemberId(Long draftId, Long memberId);

    // Helper for Auction
    Optional<DraftMember> findFirstByDraftIdAndStatusOrderByTurnOrderAsc(Long draftId, DraftMemberStatus status);

    @Query("SELECT dm FROM DraftMember dm WHERE dm.draft.id = :draftId AND dm.status = 'WAITING' ORDER BY dm.turnOrder ASC LIMIT 1")
    Optional<DraftMember> findNextWaiting(@Param("draftId") Long draftId);

    @Query("SELECT dm FROM DraftMember dm WHERE dm.draft.id = :draftId AND dm.status = 'SKIPPED' ORDER BY dm.turnOrder ASC LIMIT 1")
    Optional<DraftMember> findNextSkipped(@Param("draftId") Long draftId);

    @Query("SELECT dm FROM DraftMember dm WHERE dm.draft.id = :draftId AND dm.status IN ('WAITING', 'SKIPPED') ORDER BY dm.turnOrder ASC LIMIT 1")
    Optional<DraftMember> findNextUpcoming(@Param("draftId") Long draftId);

    java.util.List<DraftMember> findAllByDraftIdOrderByTurnOrderAsc(Long draftId);

    java.util.List<DraftMember> findAllByDraftIdAndStatus(Long draftId, DraftMemberStatus status);

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

    default void moveToBack(Long draftMemberId) {
        findById(draftMemberId).ifPresent(dm -> {
            // 현재 드래프트의 모든 멤버 조회
            List<DraftMember> allMembers = findAllByDraftIdOrderByTurnOrderAsc(dm.getDraft().getId());

            // 현재 최대 turnOrder 찾기
            int maxTurnOrder = allMembers.stream()
                    .mapToInt(m -> m.getTurnOrder() != null ? m.getTurnOrder() : 0)
                    .max()
                    .orElse(0);

            // 해당 멤버의 turnOrder를 최대값 + 1로 설정하여 맨 뒤로 이동
            dm.assignTurnOrder(maxTurnOrder + 1);
            save(dm);
        });
    }
}
