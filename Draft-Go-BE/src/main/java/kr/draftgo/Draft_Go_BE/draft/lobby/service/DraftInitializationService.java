package kr.draftgo.Draft_Go_BE.draft.lobby.service;

import kr.draftgo.Draft_Go_BE.draft.common.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.common.domain.DraftMember;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Team;
import kr.draftgo.Draft_Go_BE.draft.common.domain.Teammate;
import kr.draftgo.Draft_Go_BE.draft.common.repository.DraftMemberRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeamRepository;
import kr.draftgo.Draft_Go_BE.draft.common.repository.TeammateRepository;
import kr.draftgo.Draft_Go_BE.draft.lobby.dto.LobbyParticipant;
import kr.draftgo.Draft_Go_BE.global.exception.CustomException;
import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 드래프트 초기화 서비스
 * 로비에서 경매로 전환할 때 필요한 팀/멤버 초기화 로직을 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DraftInitializationService {

    private final MemberRepository memberRepository;
    private final TeamRepository teamRepository;
    private final TeammateRepository teammateRepository;
    private final DraftMemberRepository draftMemberRepository;

    /**
     * 드래프트 시작 시 팀 및 멤버 초기화
     *
     * @param draft 드래프트
     * @param participants 로비 참가자 목록
     */
    @Transactional
    public void initializeDraft(Draft draft, List<LobbyParticipant> participants) {
        log.info("Initializing draft for draftId: {}", draft.getId());

        // 1. 팀장 목록 추출
        List<LobbyParticipant> leaders = participants.stream()
                .filter(p -> "LEADER".equals(p.getRole()))
                .toList();

        // 2. 팀장별로 팀 생성 및 팀장을 Teammate에 등록
        for (LobbyParticipant leader : leaders) {
            createTeamWithLeader(draft, leader);
        }

        // 3. 팀원들을 DraftMember로 등록 (팀장 제외, OBSERVER 제외)
        registerDraftMembers(draft, participants, leaders);

        log.info("Draft initialization completed. Teams: {}, DraftMembers: {}",
                leaders.size(), participants.size() - leaders.size());
    }

    /**
     * 팀 생성 및 팀장 등록
     */
    private void createTeamWithLeader(Draft draft, LobbyParticipant leader) {
        Member leaderMember = memberRepository.findById(leader.getMemberId())
                .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));

        // 팀장 포인트 결정 (leaderPoint가 설정되어 있으면 사용, 없으면 0)
        Integer leaderPoint = (leader.getLeaderPoint() != null && leader.getLeaderPoint() > 0)
                ? leader.getLeaderPoint()
                : 0;

        // 팀의 실제 사용 가능한 포인트 = startPoint - leaderPoint
        int teamPoint = draft.getStartPoint() - leaderPoint;

        // 팀 생성
        Team team = Team.builder()
                .teamName(leader.getGameName() + "팀")
                .draft(draft)
                .point(teamPoint)  // 팀 포인트 = startPoint - leaderPoint
                .build();
        teamRepository.save(team);

        // 팀장을 Teammate에 등록
        Teammate leaderTeammate = Teammate.builder()
                .team(team)
                .member(leaderMember)
                .point(leaderPoint)  // 팀장이 차지하는 비용
                .isLeader(true)
                .position(leader.getPosition())
                .build();
        teammateRepository.save(leaderTeammate);

        log.debug("Team created: {} (Leader: {}, Point: {})",
                team.getTeamName(), leaderMember.getGameName(), teamPoint);
    }

    /**
     * DraftMember 등록 (경매 대상 선수들)
     */
    private void registerDraftMembers(Draft draft, List<LobbyParticipant> participants, List<LobbyParticipant> leaders) {
        // 팀원들만 필터링 (MEMBER 역할 + OBSERVER 제외)
        List<LobbyParticipant> members = participants.stream()
                .filter(p -> "MEMBER".equals(p.getRole()) && p.getPosition() != kr.draftgo.Draft_Go_BE.member.domain.Position.OBSERVER)
                .toList();

        int turnOrder = 1;
        for (LobbyParticipant memberParticipant : members) {
            Member member = memberRepository.findById(memberParticipant.getMemberId())
                    .orElseThrow(() -> new CustomException(ErrorType.MEMBER_NOT_FOUND));

            DraftMember draftMember = DraftMember.builder()
                    .draft(draft)
                    .member(member)
                    .position(memberParticipant.getPosition())
                    .build();

            // turnOrder 할당 (팀장이 아닌 경우만)
            draftMember.assignTurnOrder(turnOrder++);

            draftMemberRepository.save(draftMember);

            log.debug("DraftMember registered: {} (Position: {}, TurnOrder: {})",
                    member.getGameName(), memberParticipant.getPosition(), turnOrder - 1);
        }
    }
}
