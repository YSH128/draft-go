import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";

// Sections
import {
    LobbyInfoSection,
    CaptainsSection,
    StatsSection,
    DraftPoolSection,
    LobbyFooterSection
} from "./sections";

import UnifiedChat from "../../components/chat/UnifiedChat";

// Components
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import CodeGenerationModal from "../../components/ui/CodeGenerationModal";
import TeamLeaderSettingsModal from "../../components/ui/TeamLeaderSettingsModal";
import ParticipantProfileModal from "../../components/ui/ParticipantProfileModal";
import KickConfirmModal from "../../components/ui/KickConfirmModal";
import AlertModal from '../../components/ui/AlertModal';
import DraftStartOverlay from "../../components/ui/DraftStartOverlay";
// import Header from "../../components/layout/Header"; // Removed
// import Footer from "../../components/layout/Footer"; // Removed
import DraftLayout from "../../components/layout/DraftLayout";

// Hooks
import useAuthStore from "../../stores/useAuthStore";
import { useLobbyData } from "../../hooks/lobby/useLobbyData";
import { useLobbySocket } from "../../hooks/lobby/useLobbySocket";
import { useLobbyModals } from "../../hooks/lobby/useLobbyModals";
import { useChatSocket } from "../../hooks/useChatSocket"; // Unified Chat Socket
import { useProfileRefresh } from "../../hooks/lobby/useProfileRefresh";
import { useCaptainActions } from "../../hooks/lobby/useCaptainActions";
import { useParticipantActions } from "../../hooks/lobby/useParticipantActions";
import { useLobbyDragDrop } from "../../hooks/lobby/useLobbyDragDrop";

import { useLobbyTransform } from "../../hooks/lobby/useLobbyTransform";
import { useLobbyLifecycle } from "../../hooks/lobby/useLobbyLifecycle";
import { useLobbyControls } from "../../hooks/lobby/useLobbyControls";

import { 
    calculateAverageTier
} from "../../utils";


export default function DraftLobby() {
    const { user } = useAuthStore();
    const { draftId } = useParams();
    const navigate = useNavigate();


    // ========== TanStack Query & WebSocket ==========
    const { data: rawData, isLoading, isFetching, isError } = useLobbyData(draftId);

    // ========== Hooks ==========
    const modals = useLobbyModals();
    // const chat = useLobbyChat(user?.id); // Removed legacy chat
    const { updateMemberStats, refreshedProfilesRef } = useProfileRefresh(draftId, modals);

    // ========== Derived State (Moved Up) ==========
    const data = useMemo(() => {
        if (!rawData) return null;
        return rawData;
    }, [rawData]);

    // ========== Lifecycle Hook ==========
    const { 
        handleLobbyEnded, 
        handleDraftStarted, 
        isStarting, 
        isSelfLeavingRef 
    } = useLobbyLifecycle(draftId, modals, data, user, isLoading, isFetching);

    // ========== Socket Hook ==========
    // Chat Socket (Unified) - Ensure draftId is number for consistency with Store
    const { sendMessage } = useChatSocket(draftId ? Number(draftId) : null);
    
    // Lobby Socket (Events only)
    useLobbySocket(draftId, handleLobbyEnded, handleDraftStarted);

    const {
        lobbyTitle,
        codes,
        userRole,
        isHost,
        captains,
        draftPool,
        totalParticipants,
        activePlayersCount
    } = useLobbyTransform(data, user, refreshedProfilesRef);

    // ========== Captain Actions Hook ==========
    const captainActions = useCaptainActions(draftId, captains, draftPool, modals);

    // ========== Participant Actions Hook ==========
    const participantActions = useParticipantActions({
        draftId,
        modals,
        updateMemberStats,
        user,
        userRole,
        isSelfLeavingRef
    });

    // ========== Drag & Drop Hook ==========
    const dragDrop = useLobbyDragDrop(draftId, captains, modals);

    // ========== Controls Hook ==========
    const controls = useLobbyControls({
        draftId,
        modals,
        lifecycle: { handleDraftStarted },
        captains,
        captainActions,
        sendChatMessage: sendMessage // Pass Unified Chat sendMessage
    });

    // ========== Loading & Error States ==========
    if (isLoading) {
        return (
            <div className="draft-lobby-container">
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>로비 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="draft-lobby-container">
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-error)', fontSize: '1.2rem', marginBottom: '1rem' }}>
                        로비 데이터를 불러오지 못했습니다.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // ========== Main Render ==========
    return (
        <DraftLayout>
            <DragDropContext onDragEnd={dragDrop.onDragEnd}>
            <div className="flex h-full w-full relative">
                
                {/* --- Main Content Area --- */}
                <main className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1812] via-background-dark to-background-dark relative overflow-y-auto no-scrollbar">

                    <div className="p-8 lg:p-10 flex-1">
                        {/* Lobby Info Section */}
                        <LobbyInfoSection
                            lobbyTitle={lobbyTitle}
                            isHost={isHost}
                            totalParticipants={totalParticipants}
                            startPoint={data?.startPoint}
                            startPrice={data?.startPrice}
                            captains={captains}
                            onEditClick={() => modals.openEditDraftModal()}
                            onCodeClick={() => modals.openCodeModal()}
                        />

                        {/* Captains Section */}
                        <CaptainsSection
                            captains={captains}
                            isHost={isHost}
                            userRole={userRole}
                            maxTeamCount={data?.maxTeamCount}
                            onRoleSelect={captainActions.handleRoleSelect}
                            onReadyToggle={captainActions.handleReadyToggle}
                            onOpenSettings={controls.handleOpenSettings}
                            onOpenProfile={participantActions.handleOpenProfile}
                            onKick={participantActions.handleKickClick}
                        />

                        {/* Stats Section */}
                        <StatsSection
                            captains={captains}
                            draftPool={draftPool}
                            calculateAverageTier={calculateAverageTier}
                        />

                        {/* Draft Pool Section */}
                        <DraftPoolSection
                            draftPool={draftPool}
                            userRole={userRole}
                            isHost={isHost}
                            maxTeamCount={data?.maxTeamCount || 2}
                            captains={captains}
                            onJoinPool={participantActions.handleJoinPool}
                            onPlayerClick={participantActions.handleOpenProfile}
                            onKick={participantActions.handleKickClick}
                        />

                        {/* Lobby Footer Section */}
                        <LobbyFooterSection
                            isHost={isHost}
                            captains={captains}
                            onDestroyClick={() => modals.setIsDestroyConfirmOpen(true)}
                            onStartClick={controls.handleStartClick}
                        />
                    </div>
                </main>

                {/* --- Chat Sidebar --- */}
                <UnifiedChat
                    className="w-[380px] border-l border-[#393528] flex-shrink-0 bg-black flex flex-col shadow-2xl z-20"
                    viewerCount={totalParticipants}
                    onSendMessage={sendMessage}
                />          
            </div>

                {/* Modals */}
                <CreateDraftModal
                    isOpen={modals.isEditDraftModalOpen}
                    onClose={() => modals.closeEditDraftModal()}
                    isEditMode={true}
                    draftId={draftId}
                    initialData={data}
                    onUpdate={controls.handleDraftUpdate}
                    activeCaptainCount={captains.filter(c => c.name).length}
                    captainList={captains.filter(c => c.name)}
                />
                <CodeGenerationModal
                    isOpen={modals.isCodeModalOpen}
                    onClose={() => modals.closeCodeModal()}
                    codes={codes}
                    onRefresh={controls.handleRefreshCode}
                />
                <TeamLeaderSettingsModal
                    key={modals.selectedSettingsCaptain?.id || 'settings-modal'}
                    isOpen={modals.isSettingsModalOpen}
                    onClose={() => modals.closeSettingsModal()}
                    captain={modals.selectedSettingsCaptain}
                    pool={Object.values(draftPool).flat()}
                    onSave={controls.handleSaveSettings}
                    defaultStartPoint={data?.startPoint || 1000}
                />
                <ParticipantProfileModal
                    isOpen={modals.isProfileModalOpen}
                    onClose={() => modals.closeProfileModal()}
                    participantData={modals.selectedParticipant}
                    onRefresh={participantActions.handleRefreshProfile}
                />
                <KickConfirmModal
                    isOpen={modals.isKickModalOpen}
                    onClose={() => modals.closeKickModal()}
                    onConfirm={participantActions.confirmKick}
                    participantName={modals.kickTarget?.name}
                    isSelf={modals.kickTarget?.isSelf}
                />

                {/* Kicked Notification Modal */}
                <AlertModal
                    isOpen={modals.isKickedAlertOpen}
                    onClose={() => {
                        modals.setIsKickedAlertOpen(false);
                        navigate('/');
                    }}
                    title="퇴장 알림"
                    message="관리자에 의해 퇴장되었습니다."
                    variant="error"
                    icon="block"
                />

                {/* Lobby Closed Notification Modal */}
                <AlertModal
                    isOpen={modals.isLobbyClosedAlertOpen}
                    onClose={() => {
                        modals.setIsLobbyClosedAlertOpen(false);
                        navigate('/');
                    }}
                    title="로비 종료"
                    message="방장에 의해 로비가 종료되었습니다."
                    variant="warning"
                    icon="meeting_room"
                />

                {/* Destroy Draft Confirm Modal */}
                <AlertModal
                    isOpen={modals.isDestroyConfirmOpen}
                    onClose={() => modals.setIsDestroyConfirmOpen(false)}
                    onConfirm={controls.handleDestroyDraft}
                    title="로비 닫기 확인"
                    message={"정말로 로비를 닫으시겠습니까?\n\n모든 참가자가 퇴장되며, 드래프트 데이터가 완전히 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다."}
                    variant="error"
                    icon="warning"
                />

                {/* Update Success Notification Modal */}
                <AlertModal
                    isOpen={modals.isUpdateSuccessOpen}
                    onClose={() => modals.setIsUpdateSuccessOpen(false)}
                    title="수정 완료"
                    message="대회 정보가 성공적으로 수정되었습니다."
                    variant="success"
                    icon="check_circle"
                />

                {/* Draft Start Error Modal */}
                <AlertModal
                    isOpen={modals.startErrorModal.isOpen}
                    onClose={() => modals.setStartErrorModal({ ...modals.startErrorModal, isOpen: false })}
                    title="경매 시작 불가"
                    message={modals.startErrorModal.message}
                    variant="error"
                    icon="error"
                />

                {/* Already Started Notification Modal */}
                <AlertModal
                    isOpen={modals.isRunningAlertOpen}
                    onClose={() => {
                        modals.setIsRunningAlertOpen(false);
                        navigate(`/draft?draftId=${draftId}`);
                    }}
                    onConfirm={() => {
                        modals.setIsRunningAlertOpen(false);
                        navigate(`/draft?draftId=${draftId}`);
                    }}
                    title="경매 진행 중"
                    message={"이미 경매가 시작되었습니다.\n경매 페이지로 이동합니다."}
                    variant="info"
                    icon="gavel"
                />

                {/* Generic Alert Modal (for hook errors/warnings/success) */}
                <AlertModal
                    isOpen={modals.alertConfig.isOpen}
                    onClose={modals.closeAlert}
                    title={modals.alertConfig.title}
                    message={modals.alertConfig.message}
                    variant={modals.alertConfig.type}
                    icon={
                        modals.alertConfig.type === 'success' ? 'check_circle' :
                        modals.alertConfig.type === 'error' ? 'error' :
                        modals.alertConfig.type === 'warning' ? 'warning' :
                        'info'
                    }
                />

                {/* Background Image / Overlay */}
                {isStarting && <DraftStartOverlay />}
                <div
                    className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none z-[-1]"
                    style={{ backgroundImage: `url('/assets/wallpaper/wallpaper_1.jpg')` }}
                ></div>


            </DragDropContext>
        </DraftLayout>
    );
}
