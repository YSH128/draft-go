import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 로비 라이프사이클 및 소켓 이벤트 콜백 관리 Hook
 * @param {string} draftId - 드래프트 ID
 * @param {Object} modals - useLobbyModals 반환값
 * @param {Object} data - 로비 데이터 (derived)
 * @param {Object} user - 현재 유저 정보
 * @param {boolean} isLoading - 로딩 상태
 * @param {boolean} isFetching - 페칭 상태
 * @returns {Object} { handleLobbyEnded, handleDraftStarted, isStarting, isSelfLeavingRef }
 */
export const useLobbyLifecycle = (draftId, modals, data, user, isLoading, isFetching) => {
    const navigate = useNavigate();
    const [isStarting, setIsStarting] = useState(false);
    const isSelfLeavingRef = useRef(false);

    const { setIsLobbyClosedAlertOpen } = modals;

    const handleLobbyEnded = useCallback(() => {
        setIsLobbyClosedAlertOpen(true);
    }, [setIsLobbyClosedAlertOpen]);

    const handleDraftStarted = useCallback(() => {
        setIsStarting(true);
        setTimeout(() => {
            navigate(`/draft?draftId=${draftId}`);
        }, 2500);
    }, [draftId, navigate]);

    useEffect(() => {
        if (isLoading || isFetching || !data || !user?.id) {
            return;
        }

        if (data.status === 'IN_DRAFT') {
            modals.setIsRunningAlertOpen(true);
            return;
        }

        const myId = Number(user.id);

        const isInLeaders = data.leaders?.some(leader => Number(leader.id) === myId) || false;
        const isInMembers = Array.isArray(data.members)
            ? data.members.some(member => Number(member.id) === myId)
            : (data.members ? Object.values(data.members).flat().some(member => Number(member.id) === myId) : false);

        const isInObservers = data.observers?.some(obs => Number(obs.id) === myId) || false;

        if (!isInLeaders && !isInMembers && !isInObservers) {
            if (isSelfLeavingRef.current) {
                return;
            }

            modals.setIsKickedAlertOpen(true);
        }
    }, [data, user, navigate, isLoading, isFetching, modals]);

    return {
        handleLobbyEnded,
        handleDraftStarted,
        isStarting,
        isSelfLeavingRef
    };
};
