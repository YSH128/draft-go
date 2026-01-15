package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.dto.RiotResponseDTO;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@ConditionalOnProperty(name = "riot.api.mode", havingValue = "MOCK", matchIfMissing = true)
public class MockRiotApiService implements RiotApiService {

        @Override
        public Mono<RiotResponseDTO> searchPlayer(String gameName, String tagLine) {
                // Generate a deterministic random seed based on the username
                long seed = (gameName + tagLine).hashCode();
                java.util.Random random = new java.util.Random(seed);

                // Randomize Rank
                String[] tiers = { "IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER",
                                "GRANDMASTER", "CHALLENGER" };
                String tier = tiers[random.nextInt(tiers.length)];
                String[] divisions = { "I", "II", "III", "IV" };
                String division = divisions[random.nextInt(divisions.length)];
                int lp = random.nextInt(100);
                int wins = random.nextInt(200);
                int losses = random.nextInt(200);
                double winRate = (double) wins / (wins + losses) * 100;

                // Randomize Champions
                List<RiotResponseDTO.MostChampion> champions = new java.util.ArrayList<>();
                String[] champNames = { "Ahri", "Ezreal", "LeeSin", "Yasuo", "Zed", "Thresh", "Lux", "Jinx", "Vayne",
                                "Riven" };
                for (int i = 0; i < 3; i++) {
                        int champIndex = random.nextInt(champNames.length);
                        champions.add(new RiotResponseDTO.MostChampion(
                                        100 + champIndex,
                                        champNames[champIndex],
                                        random.nextLong(1000000)));
                }

                // Randomize Match Analysis
                RiotResponseDTO.MatchAnalysis matchAnalysis = RiotResponseDTO.MatchAnalysis.builder()
                                .totalGames(20)
                                .wins(12)
                                .losses(8)
                                .winRate(60.0)
                                .mainPosition("MID")
                                .mainPositionRate(75.5)
                                .subPosition("TOP")
                                .subPositionRate(20.5)
                                .build();

                // Randomize Match History
                List<RiotResponseDTO.MatchSummary> matchHistory = new java.util.ArrayList<>();
                String[] modes = { "CLASSIC", "ARAM", "CHERRY" };
                for (int i = 0; i < 5; i++) {
                        boolean win = random.nextBoolean();
                        matchHistory.add(RiotResponseDTO.MatchSummary.builder()
                                        .matchId("KR_" + (100000 + i))
                                        .championName(champNames[random.nextInt(champNames.length)])
                                        .kills(random.nextInt(15))
                                        .deaths(random.nextInt(10))
                                        .assists(random.nextInt(20))
                                        .win(win)
                                        .gameMode(modes[random.nextInt(modes.length)])
                                        .gameEndTimestamp(System.currentTimeMillis() - (i * 86400000L))
                                        .build());
                }

                RiotResponseDTO response = RiotResponseDTO.builder()
                                .account(RiotResponseDTO.Account.builder()
                                                .gameName(gameName)
                                                .tagLine(tagLine)
                                                .puuid("mock-puuid-" + Math.abs(seed))
                                                .summonerLevel(random.nextInt(500))
                                                .profileIconId(random.nextInt(29))
                                                .build())
                                .soloRank(RiotResponseDTO.SoloRank.builder()
                                                .hasRank(true)
                                                .tier(tier)
                                                .division(division)
                                                .lp(lp)
                                                .wins(wins)
                                                .losses(losses)
                                                .winRate(Math.round(winRate * 10.0) / 10.0)
                                                .build())
                                .mostChampions(champions)
                                .matchAnalysis(matchAnalysis) // Add this
                                .matchHistory(matchHistory) // Add this
                                .build();

                return Mono.just(response);
        }
}
