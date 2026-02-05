import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as DraftApi from '../../api/draft';
import { mapPositionToAPI } from '../../utils';

/**
 * 로비 드래그앤드롭 로직 관리 Hook
 * @param {string} draftId - 드래프트 ID
 * @param {Array} captains - 팀장 목록 (검증용)
 * @returns {Object} { onDragEnd }
 */
export const useLobbyDragDrop = (draftId, captains, modals) => {
    const queryClient = useQueryClient();

    const onDragEnd = useCallback(async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        await queryClient.cancelQueries({ queryKey: ['lobbyData', Number(draftId)] });
        const previousData = queryClient.getQueryData(['lobbyData', Number(draftId)]);

        const performOptimisticUpdate = (updateFn) => {
            queryClient.setQueryData(['lobbyData', Number(draftId)], (old) => {
                if (!old) return old;
                const newData = JSON.parse(JSON.stringify(old));
                return updateFn(newData);
            });
        };

        const targetId = draftId || 1;
        const isSourceCaptain = source.droppableId.startsWith('captain-slot');
        const isDestCaptain = destination.droppableId.startsWith('captain-slot');

        if (isSourceCaptain && isDestCaptain) {
            return;
        }

        try {
            // Pool -> Captain (Promotion)
            if (!isSourceCaptain && isDestCaptain) {
                const playerId = result.draggableId.replace('player-', '');
                if (!playerId) return;

                const slotIndex = Number(destination.droppableId.split('-')[2]);
                const existingCaptain = captains[slotIndex];
                const sourceRole = source.droppableId.split('-')[1];

                performOptimisticUpdate((draft) => {
                    let userObj = null;
                    if (!draft.members) draft.members = [];
                    if (!draft.observers) draft.observers = [];
                    if (!draft.leaders) draft.leaders = [];

                    const memberIdx = draft.members.findIndex(m => String(m.id) === playerId);
                    if (memberIdx !== -1) {
                        userObj = draft.members[memberIdx];
                        draft.members.splice(memberIdx, 1);
                    } else {
                        const obsIdx = draft.observers.findIndex(o => String(o.id) === playerId);
                        if (obsIdx !== -1) {
                            userObj = draft.observers[obsIdx];
                            draft.observers.splice(obsIdx, 1);
                        }
                    }

                    if (userObj) {
                        if (existingCaptain && existingCaptain.id) {
                            const exLeaderIdx = draft.leaders.findIndex(l => String(l.id) === String(existingCaptain.id));
                            if (exLeaderIdx !== -1) {
                                const exLeader = draft.leaders[exLeaderIdx];
                                draft.leaders.splice(exLeaderIdx, 1);
                                draft.members.push({ ...exLeader, position: 'MID' });
                            }
                        }

                        draft.leaders.push({
                            ...userObj,
                            position: sourceRole === 'SPECTATOR' ? 'TOP' : (mapPositionToAPI(sourceRole) || 'TOP'),
                            isReady: false,
                            leaderPoint: userObj.leaderPoint || 0
                        });
                    }
                    return draft;
                });

                if (existingCaptain && existingCaptain.id) {
                    await DraftApi.changeRole(targetId, {
                        targetUserId: Number(existingCaptain.id),
                        role: 'MEMBER'
                    });
                }

                if (sourceRole === 'SPECTATOR') {
                    await DraftApi.changePosition(targetId, {
                        targetUserId: Number(playerId),
                        position: 'TOP' // API requires position even for role change? Usually handled by role change but here safe.
                    });
                }

                await DraftApi.changeRole(targetId, {
                    targetUserId: Number(playerId),
                    role: 'LEADER'
                });

                return;
            }

            // Captain -> Pool (Demotion)
            if (isSourceCaptain && !isDestCaptain) {
                const captainId = result.draggableId.replace('captain-', '');
                if (!captainId) return;

                const targetRole = destination.droppableId.split('-')[1];

                performOptimisticUpdate((draft) => {
                    if (!draft.leaders) draft.leaders = [];
                    if (!draft.members) draft.members = [];
                    if (!draft.observers) draft.observers = [];

                    const leaderIdx = draft.leaders.findIndex(l => String(l.id) === captainId);
                    if (leaderIdx !== -1) {
                        const leader = draft.leaders[leaderIdx];
                        draft.leaders.splice(leaderIdx, 1);

                        if (targetRole === 'SPECTATOR') {
                            draft.observers.push(leader);
                        } else {
                            leader.position = mapPositionToAPI(targetRole);
                            draft.members.push(leader);
                        }
                    }
                    return draft;
                });

                await DraftApi.changeRole(targetId, {
                    targetUserId: Number(captainId),
                    role: 'MEMBER'
                });

                if (targetRole === 'SPECTATOR') {
                    await DraftApi.changePosition(targetId, {
                        targetUserId: Number(captainId),
                        position: 'OBSERVER'
                    });
                } else {
                    await DraftApi.changePosition(targetId, {
                        targetUserId: Number(captainId),
                        position: mapPositionToAPI(targetRole)
                    });
                }

                return;
            }

            // Pool -> Pool (Change Position)
            if (!isSourceCaptain && !isDestCaptain) {
                const targetRole = destination.droppableId.split('-')[1];
                const sourceRole = source.droppableId.split('-')[1];
                if (sourceRole === targetRole) return;

                const playerId = result.draggableId.replace('player-', '');
                if (!playerId) return;

                performOptimisticUpdate((draft) => {
                    if (!draft.members) draft.members = [];
                    if (!draft.observers) draft.observers = [];

                    let userObj = null;

                    if (sourceRole === 'SPECTATOR') {
                        const obsIdx = draft.observers.findIndex(o => String(o.id) === playerId);
                        if (obsIdx !== -1) {
                            userObj = draft.observers[obsIdx];
                            draft.observers.splice(obsIdx, 1);
                        }
                    } else {
                        const memIdx = draft.members.findIndex(m => String(m.id) === playerId);
                        if (memIdx !== -1) {
                            userObj = draft.members[memIdx];
                            draft.members.splice(memIdx, 1);
                        }
                    }

                    if (userObj) {
                        if (targetRole === 'SPECTATOR') {
                            draft.observers.push(userObj);
                        } else {
                            userObj.position = mapPositionToAPI(targetRole);
                            draft.members.push(userObj);
                        }
                    }
                    return draft;
                });

                if (targetRole === 'SPECTATOR') {
                    await DraftApi.changePosition(targetId, {
                        targetUserId: Number(playerId),
                        position: 'OBSERVER'
                    });
                } else {
                    await DraftApi.changePosition(targetId, {
                        targetUserId: Number(playerId),
                        position: mapPositionToAPI(targetRole)
                    });
                }
                return;
            }
        } catch (e) {
            console.error("Drag Drop Action Failed:", e);
            queryClient.setQueryData(['lobbyData', Number(draftId)], previousData);

            const errorCode = e.response?.data?.errorCode;
            const errorMessage = e.response?.data?.message;

            if (errorCode === 'MAX_TEAM_COUNT_EXCEEDED') {
                modals.showAlert("알림", "팀장 인원이 가득 찼습니다.", "warning");
            } else if (errorCode === 'LEADER_CANNOT_BE_OBSERVER') {
                modals.showAlert("알림", "팀장은 관전자가 될 수 없습니다.", "warning");
            } else {
                modals.showAlert("오류", "작업에 실패했습니다: " + (errorMessage || "알 수 없는 오류"), "error");
            }
        }
    }, [draftId, captains, queryClient, modals]);

    return { onDragEnd };
};
