package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;

public interface RiotApiService {
    /**
     * Search for a player by Game Name and Tag Line.
     * 
     * @param gameName Riot ID Game Name
     * @param tagLine  Riot ID Tag Line
     * @return RiotResponseDTO
     */

    /**
     * Get PUUID by Game Name and Tag Line
     */
    String getPuuid(String gameName, String tagLine);

    java.util.List<MostChampionDTO> getMostChampions(String puuid, String seasonId, int limit);

    /**
     * Refresh matches for a specific member directly using their PUUID.
     * Updates Member's last updated timestamp.
     *
     * @param member The member to refresh
     * @return Result message
     */
    String refreshMatches(kr.draftgo.Draft_Go_BE.member.domain.Member member);

    /**
     * Get League Info (Tier, Rank, LP, Wins, Losses) by PUUID.
     * 
     * @param puuid
     * @return Map containing league info
     */
    java.util.Map<String, Object> getLeagueInfoByPuuid(String puuid);
}
