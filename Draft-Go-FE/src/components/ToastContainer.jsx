import Toast from './Toast';

/**
 * Toast 컨테이너 - 여러 개의 토스트를 화면 우측 상단에 표시
 * @param {Array} toasts - 토스트 배열 [{ id, message, type, duration }]
 * @param {function} removeToast - 토스트 제거 함수
 */
export default function ToastContainer({ toasts = [], removeToast }) {
    return (
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 pointer-events-none">
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
