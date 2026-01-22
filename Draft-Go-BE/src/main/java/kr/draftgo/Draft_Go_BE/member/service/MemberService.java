package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.draftgo.Draft_Go_BE.match.domain.MatchDocument;
import kr.draftgo.Draft_Go_BE.match.repository.MatchRepository;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.Position;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private final RiotApiService riotApiService;
    private final MatchRepository matchRepository;
    private final MemberStatRepository memberStatRepository;

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
        return getMemberProfileRes(member);
    }

    public MemberProfileRes getProfileById(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return getMemberProfileRes(member);
    }

    private MemberProfileRes getMemberProfileRes(Member member) {
        kr.draftgo.Draft_Go_BE.member.domain.MemberStat stat = memberStatRepository.findByMemberId(member.getId())
                .orElse(null);
        return MemberProfileRes.from(member, MemberStatRes.from(stat));
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

    public DuplicateCheckRes checkRiotId(String gameName, String tagLine) {
        try {
            String puuid = riotApiService.getPuuid(gameName, tagLine);
            if (puuid == null) {
                return DuplicateCheckRes.builder()
                        .isDuplicate(true) // Treat as not available
                        .message("존재하지 않는 Riot ID입니다.")
                        .build();
            }
            return DuplicateCheckRes.available("Riot ID");
        } catch (Exception e) {
            return DuplicateCheckRes.builder()
                    .isDuplicate(true) // Treat as not available
                    .message("존재하지 않는 계정이거나 라이엇 API 오류입니다.")
                    .build();
        }
    }

    // --- Refactored Refresh Logic ---

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void updateMemberUpdatedAt(Member member) {
        member.refreshUpdatedAt();
        memberRepository.save(member);
    }

    public String refreshMemberData(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Cooldown Check
        if (member.getUpdatedAt() != null) {
            long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toSeconds();
            if (diff < 120) { // 2 minutes
                return "2분 쿨타임이 적용 중입니다. 잠시 후 다시 시도해주세요.";
            }
        }

        // 2. Redis Lock Check
        String lockKey = "LOCK:MATCH:" + member.getUsername();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            return "Update already in progress.";
        }

        // 3. Set Lock (10 min TTL)
        redisTemplate.opsForValue().set(lockKey, "LOCKED", Duration.ofMinutes(10));

        try {
            // 4. Update Time Immediately (Separate Transaction)
            // This ensures cooldown is enforced even if API fails later
            updateMemberUpdatedAt(member);

            // 5. External API Call & Analysis
            String apiResult = riotApiService.refreshMatches(member);
            log.info("Riot API Refresh Result for {}: {}", member.getUsername(), apiResult);

            analyzeAndSetPositions(member);
            updateMemberStats(member.getId());

            return "전적 갱신이 완료되었습니다.";

        } catch (Exception e) {
            log.error("Refresh failed for member {}", member.getUsername(), e);
            throw new RuntimeException("전적 갱신 실패: " + e.getMessage(), e);
        } finally {
            // 6. Release Lock
            redisTemplate.delete(lockKey);
        }
    }

    public MemberRefreshStatusRes getRefreshStatus(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        boolean isRefreshing = Boolean.TRUE.equals(redisTemplate.hasKey("LOCK:MATCH:" + username));
        long remaining = 0;

        if (member.getUpdatedAt() != null) {
            long diff = Duration.between(member.getUpdatedAt(), java.time.LocalDateTime.now()).toSeconds();
            if (diff < 120) {
                remaining = 120 - diff;
            }
        }

        return new MemberRefreshStatusRes(isRefreshing, remaining);
    }

    @Transactional
    public void analyzeAndSetPositions(Member member) {
        // Feature 2: Auto-Positioning
        log.info("Analyzing positions for PUUID: {}", member.getPuuid());

        List<MatchDocument> matches = matchRepository
                .findAllByPuuid(member.getPuuid());

        log.info("Found {} matches for position analysis.", matches.size());

        if (matches.isEmpty()) {
            log.info("No matches found given PUUID.");
            return;
        }

        Map<Position, Integer> positionCounts = new HashMap<>();

        for (MatchDocument match : matches) {
            // Find participant for this member
            Map<String, Object> data = match.getData();
            if (data == null)
                continue;

            Map<String, Object> info = (Map<String, Object>) data.get("info");
            if (info == null)
                continue;

            List<Map<String, Object>> participants = (List<Map<String, Object>>) info
                    .get("participants");
            if (participants == null)
                continue;

            for (Map<String, Object> p : participants) {
                if (member.getPuuid().equals(p.get("puuid"))) {
                    String teamPosition = (String) p.get("teamPosition");
                    log.info("Match {} position: {}", match.getMatchId(), teamPosition);

                    // Map teamPosition to Enum
                    Position pos = mapToPosition(teamPosition);
                    if (pos != null) {
                        positionCounts.put(pos, positionCounts.getOrDefault(pos, 0) + 1);
                    }
                    break;
                }
            }
        }

        // Sort by count
        List<Map.Entry<Position, Integer>> sorted = new ArrayList<>(
                positionCounts.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        Position mainPos = null;
        Position subPos = null;

        // Only update if current position is null (preserve existing choice)
        if (member.getMainPosition() == null && !sorted.isEmpty()) {
            mainPos = sorted.get(0).getKey();
        }

        if (member.getSubPosition() == null && sorted.size() > 1) {
            subPos = sorted.get(1).getKey();
        }

        if (mainPos != null || subPos != null) {
            member.updateProfile(mainPos, subPos);
            memberRepository.save(member);
        }
    }

    @Transactional
    public void updateMemberStats(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        MemberStat stat = memberStatRepository.findByMemberId(memberId)
                .orElse(MemberStat.builder().memberId(memberId).build());

        List<MatchDocument> matches = matchRepository
                .findAllByPuuid(member.getPuuid());

        // Sort by gameCreation descending
        matches.sort((a, b) -> Long.compare(b.getGameCreation(), a.getGameCreation()));

        int totalWins = 0;
        int totalLosses = 0;

        int recentWins = 0;
        int recentLosses = 0;
        int recentCount = 0;

        for (MatchDocument match : matches) {
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

        BigDecimal rankWinRate = calculateWinRate(totalWins, totalLosses);
        BigDecimal recentWinRate = calculateWinRate(recentWins, recentLosses);

        // Fetch League Info (Rank, LP)
        Map<String, Object> leagueInfo = riotApiService.getLeagueInfoByPuuid(member.getPuuid());
        String tier = (String) leagueInfo.get("tier");
        String rankStr = (String) leagueInfo.get("rank");
        String fullRank = (tier != null && rankStr != null) ? tier + " " + rankStr : null;
        Integer leaguePoints = (Integer) leagueInfo.get("leaguePoints");
        Integer rankWins = (Integer) leagueInfo.get("wins");
        Integer rankLosses = (Integer) leagueInfo.get("losses");

        BigDecimal rankTotalWinRate = null;
        if (rankWins != null && rankLosses != null) {
            rankTotalWinRate = calculateWinRate(rankWins, rankLosses);
        } else {
            rankWins = totalWins;
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

    private boolean checkWin(MatchDocument match, String puuid) {
        // Extract win status from match data
        Map<String, Object> data = match.getData();
        if (data == null || !data.containsKey("info"))
            return false;

        Map<String, Object> info = (Map<String, Object>) data.get("info");
        List<Map<String, Object>> participants = (List<Map<String, Object>>) info
                .get("participants");

        for (Map<String, Object> p : participants) {
            if (puuid.equals(p.get("puuid"))) {
                return (boolean) p.get("win");
            }
        }
        return false;
    }

    private BigDecimal calculateWinRate(int wins, int losses) {
        int total = wins + losses;
        if (total == 0)
            return BigDecimal.ZERO;
        return BigDecimal.valueOf(wins)
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private Position mapToPosition(String teamPosition) {
        if (teamPosition == null)
            return null;
        switch (teamPosition) {
            case "TOP":
                return Position.TOP;
            case "JUNGLE":
                return Position.JUNGLE;
            case "MIDDLE":
                return Position.MID;
            case "BOTTOM":
                return Position.BOT; // Assuming AD is BOTTOM Carry
            case "UTILITY":
                return Position.SUP; // Assuming SUP is UTILITY
            default:
                return null;
        }
    }
}
