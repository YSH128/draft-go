import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as DraftApi from '../../api/draft';
import { mapPositionToAPI } from '../../utils';
import { formatMatchData } from '../../utils/matchAdapter';

/**
 * 참가자 관련 액션을 관리하는 Hook
 * @param {Object} params
 * @param {string} params.draftId - 드래프트 ID
 * @param {Object} params.modals - useLobbyModals 반환값
 * @param {Function} params.updateMemberStats - 전적 갱신 함수
 * @param {Object} params.user - 현재 로그인한 유저
 * @param {string} params.userRole - 현재 유저의 역할
 * @param {Object} params.isSelfLeavingRef - 자진 퇴장 여부 Ref
 * @returns {Object} 참가자 액션 핸들러들
 */
export const useParticipantActions = ({
    draftId,
    modals,
    updateMemberStats,
    user,
    userRole,
    isSelfLeavingRef
}) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleOpenProfile = useCallback(async (participant) => {
        try {
            const targetId = participant.memberId || participant.id;
            let memberProfile = null;
            
            if (targetId) {
                const [profileRes, historyRes] = await Promise.allSettled([
                    DraftApi.getMemberProfile(targetId),
                    DraftApi.getMatchHistory(targetId) // Fetch recent history
                ]);

                if (profileRes.status === 'fulfilled') {
                    memberProfile = profileRes.value;
                }

                if (historyRes.status === 'fulfilled') {
                    // historyRes.value가 매치 리스트라고 가정 (혹은 페이징 객체)
                    // API 응답 구조를 확인해야 하지만, 통상적으로 리스트라면:
                    const matches = Array.isArray(historyRes.value) ? historyRes.value : (historyRes.value?.content || []);
                    
                    // 최근 20게임 계산 (matchAdapter 사용)
                    const recentMatches = matches.slice(0, 20);
                    const profileForAdapter = memberProfile || participant;

                    let wins = 0;
                    recentMatches.forEach(match => {
                        const adapted = formatMatchData(match, profileForAdapter);
                        if (adapted.win) wins++;
                    });
                    const losses = recentMatches.length - wins;
                    
                    // memberProfile에 덮어쓰기
                    if (memberProfile) {
                        memberProfile.recent20 = { wins, losses };
                    } else {
                        // 프로필 실패 시 fallback용 객체 생성
                        memberProfile = { recent20: { wins, losses } };
                    }
                }
            }
            
            const dataToUse = memberProfile || participant;
            
            const profileData = {
                id: dataToUse.id || participant.id,
                name: dataToUse.gameName || dataToUse.name || participant.name,
                summonerName: dataToUse.gameName || dataToUse.name || participant.name,
                tier: dataToUse.stats?.tier || dataToUse.tier || participant.tier,
                division: dataToUse.stats?.division || dataToUse.division || participant.division,
                lp: dataToUse.stats?.leaguePoints || dataToUse.lp || participant.lp || 0,
                gameName: dataToUse.gameName || participant.gameName,
                tagLine: dataToUse.tagLine || participant.tagLine,
                level: dataToUse.summonerLevel || dataToUse.level || participant.level,
                profileIcon: dataToUse.profileIconUrl || dataToUse.image || participant.image,
                profileIconUrl: dataToUse.profileIconUrl || dataToUse.image || participant.image,
                winRate: dataToUse.stats?.winRate || dataToUse.winRate || participant.winRate || 0,
                recent20: dataToUse.recent20 || participant.recent20 || { wins: 0, losses: 0 },
                mainPosition: dataToUse.mainPosition || participant.mainPosition,
                subPosition: dataToUse.subPosition || participant.subPosition,
                mostChampions: (dataToUse.mostChampions || participant.mostChampions || []).map(c => ({
                    name: c.championName || c.name,
                    games: c.totalGames || c.games,
                    winRate: c.winRate,
                    kda: c.kda,
                    imageUrl: c.championIconUrl || c.imageUrl || `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${c.championName || c.name}.png`
                })),
                memberId: targetId,
                lastUpdated: dataToUse.updatedAt || dataToUse.lastUpdated || participant.lastUpdated
            };
            
            modals.openProfileModal(profileData);
        } catch (e) {
            console.error('[handleOpenProfile] Failed to fetch profile:', e);
            const profileData = {
                id: participant.id,
                name: participant.name,
                summonerName: participant.name,
                tier: participant.tier,
                division: participant.division,
                lp: participant.lp,
                gameName: participant.gameName,
                tagLine: participant.tagLine,
                level: participant.level,
                profileIcon: participant.image,
                profileIconUrl: participant.image,
                winRate: participant.winRate,
                recent20: participant.recent20 || { wins: 0, losses: 0 },
                mainPosition: participant.mainPosition,
                subPosition: participant.subPosition,
                mostChampions: participant.mostChampions || [],
                memberId: participant.memberId || participant.id,
                lastUpdated: participant.lastUpdated
            };
            modals.openProfileModal(profileData);
        }
    }, [modals]);

    const handleRefreshProfile = useCallback(async () => {
        if (!modals.selectedParticipant || !modals.selectedParticipant.memberId) {
            modals.showAlert("오류", "전적 갱신 불가", "error");
            return;
        }

        try {
            const newData = await updateMemberStats(modals.selectedParticipant.memberId, true, false);
            modals.setSelectedParticipant((prev) => ({ ...prev, ...newData }));
        } catch (error) {
            console.error("Profile refresh failed:", error);
            modals.showAlert("오류", "전적 갱신에 실패했습니다.", "error");
        }
    }, [modals, updateMemberStats]);

    const handleKickClick = useCallback((target, isSelf = false) => {
        modals.openKickModal(target, isSelf);
    }, [modals]);

    const confirmKick = useCallback(async () => {
        const targetId = draftId || 1;
        const kickTargetId = modals.kickTarget?.id;

        if (!kickTargetId) {
            modals.closeKickModal();
            return;
        }

        try {
            if (modals.kickTarget?.isSelf) {
                if (isSelfLeavingRef) isSelfLeavingRef.current = true;
                // [FIX] 본인 퇴장 시에도 userId(kickTargetId) 전달 필요
                await DraftApi.kickParticipant(targetId, kickTargetId);
                modals.closeKickModal();
                navigate('/');
            } else {
                await DraftApi.kickParticipant(targetId, kickTargetId);
                queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
                modals.closeKickModal();
            }
        } catch (error) {
            console.error("Kick failed:", error);
            modals.showAlert("오류", "강제 퇴장에 실패했습니다.", "error");
            modals.closeKickModal();
        }
    }, [draftId, modals, navigate, queryClient, isSelfLeavingRef]);

    const handleJoinPool = useCallback(async (targetRole) => {
        try {
            const targetId = draftId || 1;
            const myId = user?.id;

            if (!myId) {
                modals.showAlert("알림", "로그인이 필요합니다.", "warning");
                return;
            }

            if (targetRole === 'SPECTATOR') {
                if (userRole === 'CAPTAIN') {
                    await DraftApi.changeRole(targetId, {
                        targetUserId: myId,
                        role: 'MEMBER'
                    });
                }

                await DraftApi.changePosition(targetId, {
                    targetUserId: myId,
                    position: 'OBSERVER'
                });
            } else {
                if (userRole === 'CAPTAIN') {
                    await DraftApi.changeRole(targetId, {
                        targetUserId: myId,
                        role: 'MEMBER'
                    });
                }

                await DraftApi.changePosition(targetId, {
                    targetUserId: myId,
                    position: mapPositionToAPI(targetRole)
                });
            }
        } catch (error) {
            console.error("Position change failed:", error);
            const errorCode = error.response?.data?.errorCode;
            const errorMessage = error.response?.data?.message;

            if (errorCode === 'MAX_TEAM_COUNT_EXCEEDED') {
                modals.showAlert("알림", "팀장 인원이 가득 찼습니다.", "warning");
            } else if (errorCode === 'LEADER_CANNOT_BE_OBSERVER') {
                modals.showAlert("알림", "팀장은 관전자가 될 수 없습니다.", "warning");
            } else {
                modals.showAlert("오류", "포지션 변경 실패: " + (errorMessage || error.message), "error");
            }
        }
    }, [draftId, user?.id, userRole, modals]);

    return {
        handleOpenProfile,
        handleRefreshProfile,
        handleKickClick,
        confirmKick,
        handleJoinPool
    };
};
