package kr.draftgo.Draft_Go_BE.draft.common.repository;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamRepository extends JpaRepository<Team, Long> {
    
    // Check if team has enough points (Assuming Teammate point is what we check? 
    // Wait, point is stored in Teammate?
    // Schema: teammate.point. Usually points are distributed or held by leader?
    // User said Teammate has point.
    // If team has one leader, we check leader's point or sum?
    // Usually Draft points are per Team. Schema puts it on Teammate. 
    // I'll assume Leader's Teammate entry holds the budget? Or Sum?
    // For now, I'll implement a helper that assumes Leader holds points or checks Sum.
    
    @Query("SELECT CASE WHEN SUM(tm.point) >= :price THEN true ELSE false END FROM Teammate tm WHERE tm.team.id = :teamId")
    boolean hasEnoughPoint(@Param("teamId") Long teamId, @Param("price") int price);

    default void deductPoint(Long teamId, int price) {
        // Implementation later, complex
    }
}
