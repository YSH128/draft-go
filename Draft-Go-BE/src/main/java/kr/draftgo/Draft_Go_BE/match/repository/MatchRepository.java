package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface MatchRepository extends MongoRepository<MatchDocument, String>, MatchRepositoryCustom {
    // Find matches where a specific participant PUUID exists inside the data
    // MongoDB Query: {"data.info.participants.puuid": "target_puuid"}
    @Query("{'data.info.participants.puuid': ?0}")
    List<MatchDocument> findAllByPuuid(String puuid);

    @Query("{'data.info.participants.puuid': ?0}")
    Page<MatchDocument> findAllByPuuid(String puuid, Pageable pageable);
}
