package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.dto.MemberLoginReq;
import kr.draftgo.Draft_Go_BE.member.dto.MemberSignupReq;
import kr.draftgo.Draft_Go_BE.member.dto.TokenRes;
import kr.draftgo.Draft_Go_BE.member.event.MemberSignupEvent;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
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

/**
 * 인증 관련 비즈니스 로직을 담당하는 서비스
 *
 * 회원가입, 로그인, 로그아웃, 토큰 재발급 등의 인증/인가 관련 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final RiotApiService riotApiService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 회원가입 및 자동 로그인
     *
     * @param req 회원가입 요청 정보
     * @return Access Token과 Refresh Token
     */
    @Transactional
    public TokenRes signup(MemberSignupReq req) {
        // 사용자명 중복 체크
        if (memberRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new CustomException(ErrorType.DUPLICATE_USERNAME);
        }

        // Riot 계정 정보 필수 체크
        if (req.getGameName() == null || req.getGameName().isBlank() ||
                req.getTagLine() == null || req.getTagLine().isBlank()) {
            throw new CustomException(ErrorType.REQUIRED_FIELD_MISSING, "닉네임과 태그는 필수 입력 항목입니다");
        }

        // Riot API를 통해 PUUID 가져오기
        String puuid = riotApiService.getPuuid(req.getGameName(), req.getTagLine());

        // Member 엔티티 생성 및 저장
        Member member = Member.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .gameName(req.getGameName())
                .tagLine(req.getTagLine())
                .puuid(puuid)
                .mainPosition(req.getMainPosition())
                .subPosition(req.getSubPosition())
                .build();

        Member savedMember = memberRepository.save(member);

        // 회원가입 이벤트 발행 (비동기로 통계 정보 수집)
        eventPublisher.publishEvent(new MemberSignupEvent(savedMember));

        // 자동 로그인: JWT 토큰 생성 및 Redis 저장
        return generateAndSaveTokens(savedMember.getUsername());
    }

    /**
     * 로그인
     *
     * @param req 로그인 요청 정보
     * @return Access Token과 Refresh Token
     */
    @Transactional
    public TokenRes login(MemberLoginReq req) {
        // Spring Security를 통한 인증
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        // JWT 토큰 생성 및 Redis 저장
        return generateAndSaveTokens(req.getUsername());
    }

    /**
     * 토큰 재발급
     *
     * @param refreshToken Refresh Token
     * @return 새로운 Access Token과 Refresh Token
     */
    @Transactional
    public TokenRes reissue(String refreshToken) {
        // Refresh Token 유효성 검증
        if (!jwtUtil.validateToken(refreshToken)) {
            log.warn("Invalid Refresh Token provided for reissue");
            throw new CustomException(ErrorType.INVALID_TOKEN, "유효하지 않은 Refresh Token입니다");
        }

        // 토큰에서 username 추출
        String username = jwtUtil.getUsername(refreshToken);
        log.info("Token reissue requested for user: {}", username);

        // Redis에 저장된 Refresh Token과 비교
        String storedRefreshToken = redisTemplate.opsForValue().get("RT:" + username);
        if (storedRefreshToken == null || !storedRefreshToken.equals(refreshToken)) {
            log.warn("Refresh Token Mismatch for user: {}. Redis token exists: {}", username, storedRefreshToken != null);
            throw new CustomException(ErrorType.REFRESH_TOKEN_MISMATCH);
        }

        // 새로운 토큰 생성 및 Redis 저장
        TokenRes newTokens = generateAndSaveTokens(username);
        log.info("New tokens generated for user: {}. Old RefreshToken: {}, New RefreshToken: {}",
                username,
                refreshToken.substring(0, Math.min(20, refreshToken.length())) + "...",
                newTokens.getRefreshToken().substring(0, Math.min(20, newTokens.getRefreshToken().length())) + "...");

        return newTokens;
    }

    /**
     * 로그아웃
     *
     * @param username 사용자명
     */
    @Transactional
    public void logout(String username) {
        // Redis에서 Refresh Token 삭제
        redisTemplate.delete("RT:" + username);
        log.info("User logged out: {}", username);
    }

    /**
     * JWT 토큰 생성 및 Redis 저장 (공통 로직)
     *
     * @param username 사용자명
     * @return Access Token과 Refresh Token
     */
    private TokenRes generateAndSaveTokens(String username) {
        String accessToken = jwtUtil.createAccessToken(username);
        String refreshToken = jwtUtil.createRefreshToken(username);

        // Redis에 Refresh Token 저장 (7일 TTL)
        redisTemplate.opsForValue().set(
                "RT:" + username,
                refreshToken,
                Duration.ofDays(7));

        log.info("Tokens generated for user: {}", username);

        return TokenRes.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
