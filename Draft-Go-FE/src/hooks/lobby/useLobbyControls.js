import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import * as DraftApi from '../../api/draft';

/**
 * 로비 사용자 인터랙션 및 제어 로직 Hook
 * 포함 기능: 코드 갱신, 드래프트 파기, 시작, 설정 열기/저장, 채팅 전송
 */
export const useLobbyControls = ({
    draftId,
    modals,
    lifecycle,
    captains,
    captainActions,
    sendChatMessage
}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleRefreshCode = async (type) => {
        try {
            const codeType = (type === 'TEAM_LEADER' || type === 'LEADER') ? 'LEADER' : 'MEMBER';
            const targetId = draftId || 1; 
            await DraftApi.refreshInviteCode(targetId, codeType);
            await queryClient.invalidateQueries(['lobbyData', Number(draftId)]);
        } catch (error) {
            console.error("Failed to refresh code:", error);
            alert("코드 갱신 실패");
        }
    };

    const handleDestroyDraft = async () => {
        try {
            const targetId = draftId || 1;
            await DraftApi.destroyDraft(targetId);
            modals.setIsDestroyConfirmOpen(false);
            navigate('/');
        } catch (e) {
            console.error("Destroy draft failed:", e);
        }
    };

    const handleStartClick = async () => {
        try {
            const targetId = draftId || 1;
            await DraftApi.startDraft(targetId);
            lifecycle.handleDraftStarted();
        } catch (e) {
            console.error("Start failed:", e);
            modals.setStartErrorModal({
                isOpen: true,
                message: e.response?.data?.message || e.message || "드래프트 시작 중 오류가 발생했습니다."
            });
        }
    };

    const handleOpenSettings = (captain) => {
        modals.openSettingsModal(captain);
    };

    const handleSaveSettings = async (captainId, newData) => {
        let actionData = {};
        if (captainId === 'new') {
            actionData = { isNewLeader: true, name: newData.name, point: newData.point };
        } else {
            const currentCaptain = captains.find(c => c.id === captainId);
            if (newData.name !== currentCaptain?.name) {
                 actionData = { 
                     isReplacingLeader: true, 
                     oldCaptainId: captainId, 
                     name: newData.name, 
                     point: newData.point,
                     oldPoint: currentCaptain?.leaderPoint
                 };
            } else {
                 actionData = { id: captainId, point: newData.point };
            }
        }
        await captainActions.handleSaveSettings(actionData);
        modals.closeSettingsModal();
    };

    const handleSendMessage = useCallback((text) => {
        if (!text.trim()) {
            return;
        }
        sendChatMessage(text.trim());
    }, [sendChatMessage]);

    const handleDraftUpdate = (isSuccess) => {
        queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
        if (isSuccess) modals.setIsUpdateSuccessOpen(true);
    };

    return {
        handleRefreshCode,
        handleDestroyDraft,
        handleStartClick,
        handleOpenSettings,
        handleSaveSettings,
        handleSendMessage,
        handleDraftUpdate
    };
};
