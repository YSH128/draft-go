package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import java.util.List;
import kr.draftgo.Draft_Go_BE.member.domain.Member;

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

    List<MostChampionDTO> getMostChampions(String puuid, String seasonId, int limit);

    /**
     * Refresh matches for a specific member directly using their PUUID.
     * Updates Member's last updated timestamp.
     *
     * @param member The member to refresh
     * @return Result message
     */
    String refreshMatches(Member member);

    /**
     * Get League Info (Tier, Rank, LP, Wins, Losses) by PUUID.
     * 
     * @param puuid
     * @return Map containing league info
     */
    java.util.Map<String, Object> getLeagueInfoByPuuid(String puuid);

    /**
     * Get Summoner Info (Profile Icon, Level, etc.) by PUUID.
     * Uses SUMMONER-V4 API.
     *
     * @return Map containing summoner info (id, accountId, puuid, name,
     *         profileIconId, revisionDate, summonerLevel)
     */
    java.util.Map<String, Object> getSummonerInfo(String puuid);

    /**
     * [Automation] Get Challenger League to check if season/split has reset.
     * 
     * @param queue (e.g., RANKED_SOLO_5x5)
     */
    java.util.Map<String, Object> getChallengerLeague(String queue);
}
