package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.SeasonDocument;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface SeasonRepository extends MongoRepository<SeasonDocument, String> {
    java.util.Optional<SeasonDocument> findByIsActiveTrue();
}
