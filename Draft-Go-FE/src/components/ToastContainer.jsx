import Toast from './Toast';

/**
 * Toast 컨테이너 - 토스트를 화면 중앙 하단에 표시
 * @param {Array} toasts - 토스트 배열 [{ id, message, type, duration }]
 * @param {function} removeToast - 토스트 제거 함수
 */
export default function ToastContainer({ toasts = [], removeToast }) {
    return (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
}
