package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.SeasonDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface SeasonRepository extends ReactiveMongoRepository<SeasonDocument, String> {
    Mono<SeasonDocument> findByIsActiveTrue();
}
