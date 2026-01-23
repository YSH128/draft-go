package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MostChampionStat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MostChampionStatRepository extends MongoRepository<MostChampionStat, String> {
    Optional<MostChampionStat> findByMemberId(Long memberId);
}
