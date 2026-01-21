package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MatchRepository extends MongoRepository<MatchDocument, String>, MatchRepositoryCustom {
    // Find matches where a specific participant PUUID exists inside the data
    // MongoDB Query: {"data.info.participants.puuid": "target_puuid"}
    @org.springframework.data.mongodb.repository.Query("{'data.info.participants.puuid': ?0}")
    java.util.List<MatchDocument> findAllByPuuid(String puuid);
}
