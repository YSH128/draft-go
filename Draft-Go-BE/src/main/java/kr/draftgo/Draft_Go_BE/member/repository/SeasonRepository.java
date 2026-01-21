package kr.draftgo.Draft_Go_BE.member.repository;

import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface SeasonRepository extends MongoRepository<SeasonDocument, String> {
    Optional<SeasonDocument> findByIsActiveTrue();
}
