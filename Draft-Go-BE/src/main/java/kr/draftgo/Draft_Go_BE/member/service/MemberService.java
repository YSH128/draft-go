package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private final RiotApiService riotApiService;
    private final kr.draftgo.Draft_Go_BE.match.repository.MatchRepository matchRepository;
    private final kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository memberStatRepository;

    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Transactional
    public MemberProfileRes signup(MemberSignupReq req) {
        if (memberRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        if (req.getGameName() == null || req.getGameName().isBlank() ||
                req.getTagLine() == null || req.getTagLine().isBlank()) {
            throw new IllegalArgumentException("닉네임과 태그는 필수 입력 항목입니다.");
        }

        // 1. PUUID Fetch
        String puuid = riotApiService.getPuuid(req.getGameName(), req.getTagLine());

        Member member = Member.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .gameName(req.getGameName())
                .tagLine(req.getTagLine())
                .puuid(puuid) // Set PUUID
                .mainPosition(req.getMainPosition())
                .subPosition(req.getSubPosition())
                .build();

        Member savedMember = memberRepository.save(member);

        // 2. Publish Signup Event
        eventPublisher.publishEvent(new MemberSignupEvent(savedMember));

        return MemberProfileRes.from(savedMember);
    }

    @Transactional
    public TokenRes login(MemberLoginReq req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        String accessToken = jwtUtil.createAccessToken(req.getUsername());
        String refreshToken = jwtUtil.createRefreshToken(req.getUsername());

        // Redis 저장
        redisTemplate.opsForValue().set(
                "RT:" + req.getUsername(),
                refreshToken,
                Duration.ofDays(7));

        // 백그라운드 전적 갱신 이벤트 발행 (로그인 시) - 제거됨
        // Registration 시점에만 수행하거나 수동 갱신을 사용함.
        // Member member = memberRepository.findByUsername(req.getUsername())
        // .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        // eventPublisher.publishEvent(new
        // kr.draftgo.Draft_Go_BE.member.event.MemberLoginEvent(member));

        return TokenRes.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public TokenRes reissue(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid Refresh Token");
        }

        String username = jwtUtil.getUsername(refreshToken);

        String storedRefreshToken = redisTemplate.opsForValue().get("RT:" + username);
        if (storedRefreshToken == null || !storedRefreshToken.equals(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token Mismatch");
        }

        String newAccessToken = jwtUtil.createAccessToken(username);
        String newRefreshToken = jwtUtil.createRefreshToken(username);

        redisTemplate.opsForValue().set(
                "RT:" + username,
                newRefreshToken,
                Duration.ofDays(7));

        return TokenRes.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void updateProfile(Long memberId, MemberProfileUpdateReq req) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        member.updateProfile(req.getMainPosition(), req.getSubPosition());
        memberRepository.save(member);
    }

    public MemberProfileRes getProfile(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return MemberProfileRes.from(member);
    }

    @Transactional
    public void logout(String username) {
        // Redis에서 RefreshToken 삭제
        redisTemplate.delete("RT:" + username);
    }

    public DuplicateCheckRes checkDuplicateUsername(String username) {
        boolean isDuplicate = memberRepository.existsByUsername(username);
        return isDuplicate ? DuplicateCheckRes.duplicated("아이디") : DuplicateCheckRes.available("아이디");
    }

    public DuplicateCheckRes checkDuplicateSummonerName(String gameName, String tagLine) {
        boolean isDuplicate = memberRepository.existsByGameNameAndTagLine(gameName, tagLine);
        return isDuplicate ? DuplicateCheckRes.duplicated("소환사명") : DuplicateCheckRes.available("소환사명");
    }

    @Transactional
    public void analyzeAndSetPositions(Member member) {
        // Feature 2: Auto-Positioning
        // Calculate position counts from matches
        // For simplicity, we can fetch all matches for the member and count positions.
        // A optimized query would be better (e.g. group by position), but let's assume
        // valid data processing here.

        // This requires MatchRepository dependency in MemberService or a MatchService
        // method.
        log.info("Analyzing positions for PUUID: {}", member.getPuuid());

        java.util.List<kr.draftgo.Draft_Go_BE.match.domain.MatchDocument> matches = matchRepository
                .findAllByPuuid(member.getPuuid());

        log.info("Found {} matches for position analysis.", matches.size());

        if (matches.isEmpty()) {
            log.info("No matches found given PUUID.");
            return;
        }

        java.util.Map<kr.draftgo.Draft_Go_BE.member.domain.Position, Integer> positionCounts = new java.util.HashMap<>();

        for (kr.draftgo.Draft_Go_BE.match.domain.MatchDocument match : matches) {
            // Find participant for this member
            java.util.Map<String, Object> data = match.getData();
            if (data == null)
                continue;

            java.util.Map<String, Object> info = (java.util.Map<String, Object>) data.get("info");
            if (info == null)
                continue;

            java.util.List<java.util.Map<String, Object>> participants = (java.util.List<java.util.Map<String, Object>>) info
                    .get("participants");
            if (participants == null)
                continue;

            for (java.util.Map<String, Object> p : participants) {
                if (member.getPuuid().equals(p.get("puuid"))) {
                    String teamPosition = (String) p.get("teamPosition"); // Can be TOP, JUNGLE, MIDDLE, BOTTOM,
                                                                          // UTILITY, or ""
                    log.info("Match {} position: {}", match.getMatchId(), teamPosition);

                    // Map teamPosition to Enum
                    kr.draftgo.Draft_Go_BE.member.domain.Position pos = mapToPosition(teamPosition);
                    if (pos != null) {
                        positionCounts.put(pos, positionCounts.getOrDefault(pos, 0) + 1);
                    }
                    break;
                }
            }
        }

        // Sort by count
        java.util.List<java.util.Map.Entry<kr.draftgo.Draft_Go_BE.member.domain.Position, Integer>> sorted = new java.util.ArrayList<>(
                positionCounts.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        kr.draftgo.Draft_Go_BE.member.domain.Position mainPos = null;
        kr.draftgo.Draft_Go_BE.member.domain.Position subPos = null;

        if (!sorted.isEmpty()) {
            mainPos = sorted.get(0).getKey();
        }
        if (sorted.size() > 1) {
            subPos = sorted.get(1).getKey();
        }

        member.updateProfile(mainPos, subPos);
        memberRepository.save(member);
    }

    @Transactional
    public void updateMemberStats(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        kr.draftgo.Draft_Go_BE.member.domain.MemberStat stat = memberStatRepository.findByMemberId(memberId)
                .orElse(kr.draftgo.Draft_Go_BE.member.domain.MemberStat.builder().memberId(memberId).build());

        java.util.List<kr.draftgo.Draft_Go_BE.match.domain.MatchDocument> matches = matchRepository
                .findAllByPuuid(member.getPuuid());

        // Sort by gameCreation descending
        matches.sort((a, b) -> Long.compare(b.getGameCreation(), a.getGameCreation()));

        int totalWins = 0;
        int totalLosses = 0;

        int recentWins = 0;
        int recentLosses = 0;
        int recentCount = 0;

        for (kr.draftgo.Draft_Go_BE.match.domain.MatchDocument match : matches) {
            boolean isWin = checkWin(match, member.getPuuid());
            if (isWin)
                totalWins++;
            else
                totalLosses++;

            if (recentCount < 20) {
                if (isWin)
                    recentWins++;
                else
                    recentLosses++;
                recentCount++;
            }
        }

        java.math.BigDecimal rankWinRate = calculateWinRate(totalWins, totalLosses);
        java.math.BigDecimal recentWinRate = calculateWinRate(recentWins, recentLosses);

        // Fetch League Info (Rank, LP)
        java.util.Map<String, Object> leagueInfo = riotApiService.getLeagueInfoByPuuid(member.getPuuid());
        String tier = (String) leagueInfo.get("tier");
        String rankStr = (String) leagueInfo.get("rank");
        String fullRank = (tier != null && rankStr != null) ? tier + " " + rankStr : null;
        Integer leaguePoints = (Integer) leagueInfo.get("leaguePoints");
        Integer rankWins = (Integer) leagueInfo.get("wins");
        Integer rankLosses = (Integer) leagueInfo.get("losses");

        java.math.BigDecimal rankTotalWinRate = null;
        if (rankWins != null && rankLosses != null) {
            rankTotalWinRate = calculateWinRate(rankWins, rankLosses);
        } else {
            // Fallback to calculated if API doesn't return (unlikely for Ranked)
            // or keep null if unranked
            rankWins = totalWins; // Fallback to match history count if needed, but Riot API gives accurate ranked
                                  // stats
            rankLosses = totalLosses;
            rankTotalWinRate = rankWinRate;
        }

        stat.updateProfile(
                fullRank, // Rank (Tier + Rank)
                leaguePoints, // LP
                rankTotalWinRate,
                rankWins,
                rankLosses,
                recentWinRate,
                recentWins,
                recentLosses);
        memberStatRepository.save(stat);
    }

    private boolean checkWin(kr.draftgo.Draft_Go_BE.match.domain.MatchDocument match, String puuid) {
        // Extract win status from match data
        java.util.Map<String, Object> data = match.getData();
        if (data == null || !data.containsKey("info"))
            return false;

        java.util.Map<String, Object> info = (java.util.Map<String, Object>) data.get("info");
        java.util.List<java.util.Map<String, Object>> participants = (java.util.List<java.util.Map<String, Object>>) info
                .get("participants");

        for (java.util.Map<String, Object> p : participants) {
            if (puuid.equals(p.get("puuid"))) {
                return (boolean) p.get("win");
            }
        }
        return false;
    }

    private java.math.BigDecimal calculateWinRate(int wins, int losses) {
        int total = wins + losses;
        if (total == 0)
            return java.math.BigDecimal.ZERO;
        return java.math.BigDecimal.valueOf(wins)
                .divide(java.math.BigDecimal.valueOf(total), 2, java.math.RoundingMode.HALF_UP)
                .multiply(java.math.BigDecimal.valueOf(100));
    }

    private kr.draftgo.Draft_Go_BE.member.domain.Position mapToPosition(String teamPosition) {
        if (teamPosition == null)
            return null;
        switch (teamPosition) {
            case "TOP":
                return kr.draftgo.Draft_Go_BE.member.domain.Position.TOP;
            case "JUNGLE":
                return kr.draftgo.Draft_Go_BE.member.domain.Position.JUNGLE;
            case "MIDDLE":
                return kr.draftgo.Draft_Go_BE.member.domain.Position.MID;
            case "BOTTOM":
                return kr.draftgo.Draft_Go_BE.member.domain.Position.BOT; // Assuming AD is BOTTOM Carry
            case "UTILITY":
                return kr.draftgo.Draft_Go_BE.member.domain.Position.SUP; // Assuming SUP is UTILITY
            default:
                return null;
        }
    }
}
