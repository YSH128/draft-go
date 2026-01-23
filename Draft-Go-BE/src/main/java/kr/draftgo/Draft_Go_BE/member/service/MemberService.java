package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.match.domain.MostChampionStat;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.match.repository.MostChampionStatRepository;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
    private final MemberStatRepository memberStatRepository;
    private final MostChampionStatRepository mostChampionStatRepository; // Added

    private final ApplicationEventPublisher eventPublisher;

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
        // Fetch MemberStat (MySQL)
        MemberStat stat = memberStatRepository.findByMemberId(member.getId())
                .orElse(null);

        // Fetch MostChampionStat (MongoDB)
        List<MostChampionRes> mostChampions = mostChampionStatRepository.findByMemberId(member.getId())
                .map(mostStat -> mostStat.getMostChampions().stream()
                        .map(MostChampionRes::from)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        return MemberProfileRes.from(member, MemberStatRes.from(stat), mostChampions);
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
}
