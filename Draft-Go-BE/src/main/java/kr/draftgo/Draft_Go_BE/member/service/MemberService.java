package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.jwt.JwtUtil;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.dto.MemberLoginReq;
import kr.draftgo.Draft_Go_BE.member.dto.MemberProfileUpdateReq;
import kr.draftgo.Draft_Go_BE.member.dto.MemberSignupReq;
import kr.draftgo.Draft_Go_BE.member.dto.TokenRes;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
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
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public void signup(MemberSignupReq req) {
        if (memberRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        if (req.getGameName() == null || req.getGameName().isBlank() ||
                req.getTagLine() == null || req.getTagLine().isBlank()) {
            throw new IllegalArgumentException("닉네임과 태그는 필수 입력 항목입니다.");
        }

        Member member = Member.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .gameName(req.getGameName())
                .tagLine(req.getTagLine())
                .mainPosition(req.getMainPosition())
                .subPosition(req.getSubPosition())
                .rank(req.getRank())
                .leaguePoint(req.getLeaguePoint())
                .build();

        memberRepository.save(member);
    }

    @Transactional
    public TokenRes login(MemberLoginReq req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        String accessToken = jwtUtil.createAccessToken(req.getUsername());
        String refreshToken = jwtUtil.createRefreshToken(req.getUsername());

        // Refresh Token Redis 저장 (예: 7일)
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

        member.updateProfile(req.getMainPosition(), req.getSubPosition(), req.getRank(), req.getLeaguePoint());
        memberRepository.save(member);
    }
}
