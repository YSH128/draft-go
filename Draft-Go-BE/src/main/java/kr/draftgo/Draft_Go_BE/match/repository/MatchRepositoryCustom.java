package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;

public interface MatchRepositoryCustom {
    java.util.List<MostChampionDTO> findMostChampions(String puuid, long startTime, long endTime, int limit);

    java.util.Optional<MatchDocument> findLatestMatchByPuuid(String puuid);
}
