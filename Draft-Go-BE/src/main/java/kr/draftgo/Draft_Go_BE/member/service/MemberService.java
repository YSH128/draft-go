package kr.draftgo.Draft_Go_BE.member.service;

import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.match.dto.MostChampionRes;
import kr.draftgo.Draft_Go_BE.match.repository.MostChampionStatRepository;
import kr.draftgo.Draft_Go_BE.match.service.RiotApiService;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.dto.*;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 회원 정보 관리 비즈니스 로직을 담당하는 서비스
 *
 * 회원 정보 조회, 프로필 수정, 중복 확인 등의 회원 데이터 관련 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberStatRepository memberStatRepository;
    private final MostChampionStatRepository mostChampionStatRepository;
    private final RiotApiService riotApiService;

    /**
     * 사용자명으로 회원 프로필 조회
     *
     * @param username 사용자명
     * @return 회원 프로필 정보 (통계, 최고 챔피언 포함)
     */
    public MemberProfileRes getProfile(String username) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));
        return getMemberProfileRes(member);
    }

    /**
     * 회원 ID로 회원 프로필 조회
     *
     * @param memberId 회원 ID
     * @return 회원 프로필 정보 (통계, 최고 챔피언 포함)
     */
    public MemberProfileRes getProfileById(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));
        return getMemberProfileRes(member);
    }

    /**
     * 회원 프로필 수정
     *
     * @param memberId 회원 ID
     * @param req      프로필 수정 요청 정보
     */
    @Transactional
    public void updateProfile(Long memberId, MemberProfileUpdateReq req) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));

        member.updateProfile(req.getMainPosition(), req.getSubPosition(), req.getBio());
        memberRepository.save(member);

        log.info("Profile updated for member ID: {}", memberId);
    }

    /**
     * 아이디 중복 확인
     *
     * @param username 확인할 사용자명
     * @return 중복 여부 응답
     */
    public DuplicateCheckRes checkDuplicateUsername(String username) {
        boolean isDuplicate = memberRepository.existsByUsername(username);
        return isDuplicate ? DuplicateCheckRes.duplicated("아이디") : DuplicateCheckRes.available("아이디");
    }

    /**
     * 소환사명 중복 확인
     *
     * @param gameName 게임 내 닉네임
     * @param tagLine  태그
     * @return 중복 여부 응답
     */
    public DuplicateCheckRes checkDuplicateSummonerName(String gameName, String tagLine) {
        boolean isDuplicate = memberRepository.existsByGameNameAndTagLine(gameName, tagLine);
        return isDuplicate ? DuplicateCheckRes.duplicated("소환사명") : DuplicateCheckRes.available("소환사명");
    }

    /**
     * Riot ID 실존 확인
     *
     * Riot API를 통해 해당 계정이 실제로 존재하는지 확인합니다.
     *
     * @param gameName 게임 내 닉네임
     * @param tagLine  태그
     * @return 실존 여부 응답
     */
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
            log.warn("Failed to check Riot ID: {}#{} - {}", gameName, tagLine, e.getMessage());
            return DuplicateCheckRes.builder()
                    .isDuplicate(true) // Treat as not available
                    .message("존재하지 않는 계정이거나 라이엇 API 오류입니다.")
                    .build();
        }
    }

    /**
     * Member 엔티티로부터 프로필 응답 DTO 생성 (내부 헬퍼 메서드)
     *
     * MySQL의 통계 정보와 MongoDB의 최고 챔피언 정보를 결합하여 반환합니다.
     *
     * @param member 회원 엔티티
     * @return 회원 프로필 응답 DTO
     */
    private MemberProfileRes getMemberProfileRes(Member member) {
        // MySQL에서 회원 통계 조회
        MemberStat stat = memberStatRepository.findByMemberId(member.getId())
                .orElse(null);

        // MongoDB에서 최고 챔피언 통계 조회
        List<MostChampionRes> mostChampions = mostChampionStatRepository.findByMemberId(member.getId())
                .map(mostStat -> mostStat.getMostChampions().stream()
                        .map(MostChampionRes::from)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        return MemberProfileRes.from(member, MemberStatRes.from(stat), mostChampions);
    }
}
