package kr.draftgo.Draft_Go_BE.match.repository;

import kr.draftgo.Draft_Go_BE.match.dto.MostChampionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;

@RequiredArgsConstructor
public class MatchRepositoryCustomImpl implements MatchRepositoryCustom {

        private final ReactiveMongoTemplate mongoTemplate;

        @Override
        public Flux<MostChampionDTO> findMostChampions(String puuid, long startTime, long endTime, int limit) {
                // Aggregation Pipeline
                Aggregation aggregation = newAggregation(
                                // 1. Match: Time range (Root field) & Participant PUUID check (Nested in data)
                                match(Criteria.where("gameCreation").gte(startTime).lte(endTime)
                                                .and("data.metadata.participants").is(puuid)),

                                // 2. Unwind: Flatten participants array to handle each participant individually
                                unwind("data.info.participants"),

                                // 3. Match: Check if the unwound participant is the target user
                                match(Criteria.where("data.info.participants.puuid").is(puuid)),

                                // 4. Group: Aggregate by championName
                                group("data.info.participants.championName")
                                                .count().as("totalGames")
                                                .sum(ConditionalOperators
                                                                .when(Criteria.where("data.info.participants.win")
                                                                                .is(true))
                                                                .then(1).otherwise(0))
                                                .as("wins")
                                                .sum("data.info.participants.kills").as("kills")
                                                .sum("data.info.participants.deaths").as("deaths")
                                                .sum("data.info.participants.assists").as("assists"),

                                // 5. Sort: Most played first
                                sort(Sort.Direction.DESC, "totalGames"),

                                // 6. Limit: Top N champions
                                limit(limit),

                                // 7. Project: Start shaping the result (Calculation done in mapping phase or
                                // here)
                                // Note: Complex arithmetic in Mongo is verbose. easier to just return sums and
                                // calc stats in Java.
                                project("totalGames", "wins", "kills", "deaths", "assists")
                                                .and("_id").as("championName"));

                return mongoTemplate.aggregate(aggregation, "matches", MostChampionDTO.class)
                                .map(dto -> {
                                        // Calculate derived stats in Java
                                        dto.setLosses(dto.getTotalGames() - dto.getWins());
                                        double winRate = (double) dto.getWins() / dto.getTotalGames() * 100.0;
                                        dto.setWinRate(Math.round(winRate * 100.0) / 100.0); // 2 decimal places

                                        double deaths = dto.getDeaths() == 0 ? 1 : dto.getDeaths();
                                        double kda = (dto.getKills() + dto.getAssists()) / deaths;
                                        dto.setKda(Math.round(kda * 100.0) / 100.0);

                                        // Averages per game
                                        dto.setKills(Math.round(dto.getKills() / dto.getTotalGames() * 10.0) / 10.0);
                                        dto.setDeaths(Math.round(dto.getDeaths() / dto.getTotalGames() * 10.0) / 10.0);
                                        dto.setAssists(Math.round(dto.getAssists() / dto.getTotalGames() * 10.0)
                                                        / 10.0);

                                        return dto;
                                });
        }

        @Override
        public Mono<MatchDocument> findLatestMatchByPuuid(String puuid) {
                // Find the latest match where the participant list contains the PUUID
                return mongoTemplate.findOne(
                                org.springframework.data.mongodb.core.query.Query.query(
                                                Criteria.where("data.metadata.participants").is(puuid))
                                                .with(Sort.by(Sort.Direction.DESC, "gameCreation"))
                                                .limit(1),
                                MatchDocument.class, "matches");
        }
}
