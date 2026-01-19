package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RiotApiService {
    /**
     * Search for a player by Game Name and Tag Line.
     * 
     * @param gameName Riot ID Game Name
     * @param tagLine  Riot ID Tag Line
     * @return Mono of RiotResponseDTO
     */
    Mono<RiotResponseDTO> searchPlayer(String gameName, String tagLine);

    Flux<MostChampionDTO> getMostChampions(String gameName, String tagLine, String seasonId, int limit);
}
