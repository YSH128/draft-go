package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import reactor.core.publisher.Flux;

public interface MatchRepositoryCustom {
    Flux<MostChampionDTO> findMostChampions(String puuid, long startTime, long endTime, int limit);
}
