package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import java.util.List;
import java.util.Optional;

public interface MatchRepositoryCustom {
    List<MostChampionDTO> findMostChampions(String puuid, long startTime, long endTime, int limit);

    Optional<MatchDocument> findLatestMatchByPuuid(String puuid);
}
