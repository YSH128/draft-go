package kr.draftgo.Draft_Go_BE.draft.service;

import kr.draftgo.Draft_Go_BE.draft.domain.Draft;
import kr.draftgo.Draft_Go_BE.draft.dto.DraftDto;
import kr.draftgo.Draft_Go_BE.draft.dto.DraftParticipant;
import kr.draftgo.Draft_Go_BE.draft.repository.DraftRedisRepository;
import kr.draftgo.Draft_Go_BE.draft.repository.DraftRepository;
import kr.draftgo.Draft_Go_BE.member.domain.Member;
import kr.draftgo.Draft_Go_BE.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DraftService {

    private final DraftRepository draftRepository;
    private final MemberRepository memberRepository;
    private final DraftRedisRepository draftRedisRepository;

    @Transactional
    public DraftDto.DraftCreateRes createDraft(DraftDto.DraftCreateReq req, Member owner) {
        int startPrice = req.getStartPrice() != null ? req.getStartPrice() : 100;
        int startPoint = req.getStartPoint() != null ? req.getStartPoint() : 1000;

        if (startPrice > startPoint) {
            throw new IllegalArgumentException("시작 포인트는 시작 가격보다 커야 합니다.");
        }

        Draft draft = Draft.builder()
                .owner(owner)
                .title(req.getTitle())
                .startPrice(startPrice)
                .startPoint(startPoint)
                .build();

        draftRepository.save(draft);

        return DraftDto.DraftCreateRes.builder()
                .draftId(draft.getId())
                .teamMemberCode(draft.getMemberCode())
                .teamLeaderCode(draft.getLeaderCode())
                .build();
    }

    @Transactional
    public Long joinDraft(DraftDto.JoinDraftReq req, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 1. Try to find by Member Code (Candidate)
        Draft draftAsMember = draftRepository.findByMemberCode(req.getDraftCode()).orElse(null);
        if (draftAsMember != null) {
            joinToLobby(draftAsMember.getId(), member, req, "MEMBER");
            return draftAsMember.getId();
        }

        // 2. Try to find by Leader Code (Team Leader)
        Draft draftAsLeader = draftRepository.findByLeaderCode(req.getDraftCode()).orElse(null);
        if (draftAsLeader != null) {
            joinToLobby(draftAsLeader.getId(), member, req, "LEADER");
            return draftAsLeader.getId();
        }

        throw new IllegalArgumentException("유효하지 않은 참여 코드입니다.");
    }

    private void joinToLobby(Long draftId, Member member, DraftDto.JoinDraftReq req, String role) {
        if (draftRedisRepository.isParticipating(draftId, member.getId())) {
            throw new IllegalArgumentException("이미 드래프트에 참여 중입니다.");
        }

        DraftParticipant participant = DraftParticipant.builder()
                .memberId(member.getId())
                .gameName(member.getGameName())
                .role(role)
                .position(req.getPosition())
                .isReady(false)
                .build();

        draftRedisRepository.join(draftId, participant);
    }
}