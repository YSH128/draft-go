import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as DraftApi from '../../api/draft';
import { mapPositionToAPI } from '../../utils';

/**
 * 팀장 관련 액션을 관리하는 Hook
 * @param {string} draftId - 드래프트 ID
 * @param {Array} captains - 팀장 목록
 * @param {Object} draftPool - 드래프트 풀
 * @returns {Object} 팀장 액션 핸들러들
 */
export const useCaptainActions = (draftId, captains, draftPool, modals) => {
    const queryClient = useQueryClient();

    /**
     * 팀장 포지션 선택
     */
    const handleRoleSelect = useCallback(async (captainId, role) => {
        try {
            const targetId = draftId || 1;
            const apiPosition = mapPositionToAPI(role);
            await DraftApi.changePosition(targetId, {
                targetUserId: Number(captainId),
                position: apiPosition
            });
            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
        } catch (e) {
            console.error("Role select failed:", e);
        }
    }, [draftId, queryClient]);

    /**
     * 팀장 준비 상태 토글
     */
    const handleReadyToggle = useCallback(async (captainId) => {
        try {
            const targetId = draftId || 1;
            const captain = captains.find(c => c.id === captainId);
            if (!captain) return;

            await DraftApi.toggleReady(targetId, !captain.ready);
            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
        } catch (e) {
            console.error("Ready toggle failed:", e);
        }
    }, [draftId, captains, queryClient]);

    /**
     * 팀장 설정 저장 (멤버 선택, 포인트 설정)
     */
    const handleSaveSettings = useCallback(async (newData) => {
        try {
            const targetId = draftId || 1;

            // 멤버와 현재 역할(Role)을 찾는 헬퍼 함수
            const findMemberWithRole = (name) => {
                if (!draftPool) return null;
                for (const [role, members] of Object.entries(draftPool)) {
                    if (!Array.isArray(members)) continue;
                    const member = members.find(m => m.name === name);
                    if (member) return { member, role };
                }
                return null;
            };

            // 새 팀장 승격 로직
            const promoteToLeader = async (name, point) => {
                 const result = findMemberWithRole(name);
                 if (!result) {
                     modals.showAlert("오류", "선택한 유저를 찾을 수 없습니다.", "error");
                     return false;
                 }
                 const { member, role } = result;

                 // 관전자인 경우 포지션 설정 필요 (TOP으로 기본 설정)
                 if (role === 'SPECTATOR') {
                     await DraftApi.changePosition(targetId, {
                         targetUserId: Number(member.id),
                         position: 'TOP'
                     });
                 }

                 await DraftApi.changeRole(targetId, {
                     targetUserId: Number(member.id),
                     role: 'LEADER'
                 });

                 if (point !== undefined && point !== null) {
                     await DraftApi.setLeaderPoint(targetId, {
                         leaderId: Number(member.id),
                         point: Number(point)
                     });
                 }
                 return true;
            };

            if (newData.isNewLeader) {
                // 신규 팀장 추가
                const success = await promoteToLeader(newData.name, newData.point);
                if (!success) return { success: false };

            } else if (newData.isReplacingLeader) {
                // 팀장 교체
                // 1. 기존 팀장 -> 일반 멤버 (강등)
                await DraftApi.changeRole(targetId, {
                    targetUserId: Number(newData.oldCaptainId),
                    role: 'MEMBER'
                });

                // 2. 신규 팀장 승격
                const pointToUse = (newData.point !== undefined && newData.point !== null) 
                    ? newData.point 
                    : (newData.oldPoint || 1000);
                
                const success = await promoteToLeader(newData.name, pointToUse);
                if (!success) return { success: false };

            } else {
                // 기존 팀장 포인트만 변경
                await DraftApi.setLeaderPoint(targetId, {
                    leaderId: Number(newData.id),
                    point: Number(newData.point)
                });
            }

            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
            return { success: true };
        } catch (e) {
            console.error("Save settings failed:", e);
            return { success: false };
        }
    }, [draftId, draftPool, queryClient, modals]);

    return {
        handleRoleSelect,
        handleReadyToggle,
        handleSaveSettings,
    };
};
