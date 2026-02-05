import { useState, useMemo } from 'react';

/**
 * 로비의 모든 모달 상태를 통합 관리하는 Hook
 * @returns {Object} 모달 상태와 핸들러
 */
export const useLobbyModals = () => {
    // 모달 상태
    const [isEditDraftModalOpen, setIsEditDraftModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedSettingsCaptain, setSelectedSettingsCaptain] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isKickModalOpen, setIsKickModalOpen] = useState(false);
    const [kickTarget, setKickTarget] = useState(null);

    // Alert 모달 상태
    const [isKickedAlertOpen, setIsKickedAlertOpen] = useState(false);
    const [isLobbyClosedAlertOpen, setIsLobbyClosedAlertOpen] = useState(false);
    const [isDestroyConfirmOpen, setIsDestroyConfirmOpen] = useState(false);
    const [isUpdateSuccessOpen, setIsUpdateSuccessOpen] = useState(false);
    const [isRunningAlertOpen, setIsRunningAlertOpen] = useState(false);
    const [startErrorModal, setStartErrorModal] = useState({ isOpen: false, message: '' });

    return useMemo(() => ({
        // Edit Draft Modal
        isEditDraftModalOpen,
        setIsEditDraftModalOpen,
        openEditDraftModal: () => setIsEditDraftModalOpen(true),
        closeEditDraftModal: () => setIsEditDraftModalOpen(false),

        // Code Modal
        isCodeModalOpen,
        setIsCodeModalOpen,
        openCodeModal: () => setIsCodeModalOpen(true),
        closeCodeModal: () => setIsCodeModalOpen(false),

        // Settings Modal
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        selectedSettingsCaptain,
        setSelectedSettingsCaptain,
        openSettingsModal: (captain) => {
            setSelectedSettingsCaptain(captain);
            setIsSettingsModalOpen(true);
        },
        closeSettingsModal: () => {
            setIsSettingsModalOpen(false);
            setSelectedSettingsCaptain(null);
        },

        // Profile Modal
        isProfileModalOpen,
        setIsProfileModalOpen,
        selectedParticipant,
        setSelectedParticipant,
        openProfileModal: (participant) => {
            setSelectedParticipant(participant);
            setIsProfileModalOpen(true);
        },
        closeProfileModal: () => {
            setIsProfileModalOpen(false);
            setSelectedParticipant(null);
        },

        // Kick Modal
        isKickModalOpen,
        setIsKickModalOpen,
        kickTarget,
        setKickTarget,
        openKickModal: (target, isSelf = false) => {
            setKickTarget({ ...target, isSelf });
            setIsKickModalOpen(true);
        },
        closeKickModal: () => {
            setIsKickModalOpen(false);
            setKickTarget(null);
        },

        // Alert Modals
        isKickedAlertOpen,
        setIsKickedAlertOpen,
        isLobbyClosedAlertOpen,
        setIsLobbyClosedAlertOpen,
        isDestroyConfirmOpen,
        setIsDestroyConfirmOpen,
        isUpdateSuccessOpen,
        setIsUpdateSuccessOpen,
        isRunningAlertOpen,
        setIsRunningAlertOpen,
        startErrorModal,
        setStartErrorModal,
    }), [
        isEditDraftModalOpen,
        isCodeModalOpen,
        isSettingsModalOpen,
        selectedSettingsCaptain,
        isProfileModalOpen,
        selectedParticipant,
        isKickModalOpen,
        kickTarget,
        isKickedAlertOpen,
        isLobbyClosedAlertOpen,
        isDestroyConfirmOpen,
        isUpdateSuccessOpen,
        isRunningAlertOpen,
        startErrorModal
    ]);
};
