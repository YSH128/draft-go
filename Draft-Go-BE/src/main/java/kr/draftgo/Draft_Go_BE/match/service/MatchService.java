package kr.draftgo.Draft_Go_BE.match.service;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.dto.MatchRes;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<MatchRes> getMatchHistory(Long memberId, Pageable pageable) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String puuid = member.getPuuid();
        if (puuid == null || puuid.isEmpty()) {
            throw new IllegalArgumentException("회원의 PUUID 정보가 없습니다. (Riot 계정 미연동)");
        }

        // Optimization: If member match history has never been updated, return empty
        if (member.getUpdatedAt() == null) {
            return java.util.Collections.emptyList();
        }

        Page<MatchDocument> matches = matchRepository.findAllByPuuid(puuid, pageable);

        return matches.stream()
                .map(match -> convertToMatchRes(match, puuid))
                .filter(res -> res != null)
                .collect(Collectors.toList());
    }

    private MatchRes convertToMatchRes(MatchDocument match, String puuid) {
        try {
            Map<String, Object> data = match.getData();
            if (data == null)
                return null;

            Map<String, Object> info = (Map<String, Object>) data.get("info");
            if (info == null)
                return null;

            Long gameCreation = ((Number) info.get("gameCreation")).longValue();
            Long gameDuration = ((Number) info.get("gameDuration")).longValue();
            String gameMode = (String) info.get("gameMode");

            List<Map<String, Object>> participants = (List<Map<String, Object>>) info.get("participants");
            if (participants == null)
                return null;

            // Find my participant data
            Map<String, Object> myData = null;
            for (Map<String, Object> p : participants) {
                if (puuid.equals(p.get("puuid"))) {
                    myData = p;
                    break;
                }
            }

            if (myData == null)
                return null;

            String championName = (String) myData.get("championName");
            Integer championId = (Integer) myData.get("championId");
            int kills = ((Number) myData.get("kills")).intValue();
            int deaths = ((Number) myData.get("deaths")).intValue();
            int assists = ((Number) myData.get("assists")).intValue();
            boolean win = (boolean) myData.get("win");

            double kda = 0.0;
            if (deaths == 0) {
                kda = (double) (kills + assists);
            } else {
                kda = (double) (kills + assists) / deaths;
            }
            // Round to 2 decimal places
            kda = Math.round(kda * 100.0) / 100.0;

            return MatchRes.builder()
                    .matchId(match.getMatchId())
                    .gameCreation(gameCreation)
                    .gameDuration(gameDuration)
                    .gameMode(gameMode)
                    .championName(championName)
                    .championId(championId)
                    .kills(kills)
                    .deaths(deaths)
                    .assists(assists)
                    .kda(kda)
                    .win(win)
                    .build();

        } catch (Exception e) {
            log.warn("Error converting match {} for puuid {}", match.getMatchId(), puuid, e);
            return null;
        }
    }
}
