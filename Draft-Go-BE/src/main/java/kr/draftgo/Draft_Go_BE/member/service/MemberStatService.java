package kr.draftgo.Draft_Go_BE.member.service;

import jakarta.transaction.Transactional;
import kr.draftgo.Draft_Go_BE.member.domain.MemberStat;
import kr.draftgo.Draft_Go_BE.member.domain.SeasonDocument;
import kr.draftgo.Draft_Go_BE.member.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberStatService {
    private final MemberStatRepository memberStatRepository;
    private final SeasonService seasonService;
    /**
     * MemberStat 일괄 조회 헬퍼 메서드
     */
    @Transactional
    public Map<Long, MemberStat> getMemberStatsForCurrentSeason(List<Long> memberIds) {
        // 활성 시즌 조회
        SeasonDocument activeSeason = seasonService.getActiveSeason();
        String seasonId = activeSeason != null ? activeSeason.getSeasonId() : null;
        if (seasonId != null) {
            return memberStatRepository.findByMember_IdInAndSeasonId(memberIds, seasonId).stream()
                    .collect(Collectors.toMap(stat -> stat.getMember().getId(), stat -> stat));
        } else {
            return memberStatRepository.findByMember_IdIn(memberIds).stream()
                    .collect(Collectors.toMap(stat -> stat.getMember().getId(), stat -> stat));
        }
    }
}
