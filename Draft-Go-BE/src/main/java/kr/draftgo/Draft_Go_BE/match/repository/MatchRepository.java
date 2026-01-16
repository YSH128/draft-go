package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface MatchRepository extends ReactiveMongoRepository<MatchDocument, String> {
    // Find matches where a specific participant PUUID exists inside the data
    // MongoDB Query: {"data.info.participants.puuid": "target_puuid"}
    // Note: This requires the raw data structure to be consistent.
    // For simplicity in this project, we might query all and filter, OR rely on a
    // separate mapping if performance is key.
    // But since we store "data", we can use @Query or property path if Spring Data
    // supports map transversal.

    // Actually, for "Recent 20 games", we usually fetch MatchIDs from Riot (or
    // cache them) and then look up documents.
    // Or we can index PUUIDs. simpler approach: Just store it.
}
