import { useState, useCallback } from 'react';

/**
 * Toast 알림을 관리하는 커스텀 훅
 * @returns {Object} { toasts, showToast, removeToast }
 */
export default function useToast() {
    const [toasts, setToasts] = useState([]);

    /**
     * 새로운 토스트 알림 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 'error' | 'warning' | 'success' | 'info'
     * @param {number} duration - 표시 시간 (ms), 기본값 3000ms
     */
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random(); // 동시에 여러 토스트 생성 시 고유 ID 보장
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    /**
     * 토스트 제거
     * @param {number} id - 제거할 토스트의 ID
     */
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
    };
}
