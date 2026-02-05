import { useEffect, useRef } from 'react';

/**
 * Toast 알림 컴포넌트
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'error' | 'warning' | 'success' | 'info'
 * @param {function} onClose - 닫기 콜백
 * @param {number} duration - 표시 시간 (ms), 기본 5000ms
 */
export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    const onCloseRef = useRef(onClose);

    // onClose가 변경될 때마다 ref 업데이트
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]); // onClose 의존성 제거

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500/90 border-red-400';
            case 'warning':
                return 'bg-yellow-500/90 border-yellow-400';
            case 'success':
                return 'bg-green-500/90 border-green-400';
            default:
                return 'bg-primary/90 border-primary-bright';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div
            className={`
        animate-slide-in-up
        flex items-center gap-3 rounded-lg border-l-4 px-4 py-3
        shadow-lg backdrop-blur-sm
        ${getTypeStyles()}
      `}
            role="alert"
        >
            <span className="text-xl">{getIcon()}</span>
            <span className="text-sm font-medium text-white">{message}</span>
            <button
                onClick={onClose}
                className="ml-auto text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
            >
                ✕
            </button>
        </div>
    );
}
