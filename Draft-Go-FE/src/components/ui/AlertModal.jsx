import React from 'react';

export default function AlertModal({ 
  isOpen, 
  onClose, 
  onConfirm, // optional: 확인 버튼 클릭 시 실행할 콜백
  title = "알림", 
  message, 
  icon = "info",
  variant = "info" // 'info', 'warning', 'error', 'success'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      // onConfirm이 있는 경우 (예: 페이지 이동) 바로 실행하고 onClose는 호출하지 않음
      onConfirm();
    } else {
      // onConfirm이 없는 경우 단순히 모달만 닫기
      onClose();
    }
  };

  const variantStyles = {
    info: {
      border: 'border-primary/50',
      bg: 'bg-[#1a1812]',
      headerBg: 'bg-primary/10',
      headerBorder: 'border-primary/30',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      textColor: 'text-primary',
      shadow: 'shadow-[0_0_40px_rgba(200,155,60,0.4)]',
      buttonBg: 'bg-primary',
      buttonHover: 'hover:bg-hextech-gold-dark',
      buttonShadow: 'shadow-[0_0_15px_rgba(200,155,60,0.4)]',
      buttonHoverShadow: 'hover:shadow-[0_0_25px_rgba(200,155,60,0.6)]',
    },
    warning: {
      border: 'border-orange-500/50',
      bg: 'bg-[#1a1812]',
      headerBg: 'bg-orange-950/30',
      headerBorder: 'border-orange-500/30',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      textColor: 'text-orange-500',
      shadow: 'shadow-[0_0_40px_rgba(249,115,22,0.4)]',
      buttonBg: 'bg-orange-600',
      buttonHover: 'hover:bg-orange-500',
      buttonShadow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      buttonHoverShadow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.6)]',
    },
    error: {
      border: 'border-red-500/50',
      bg: 'bg-[#1a1812]',
      headerBg: 'bg-red-950/30',
      headerBorder: 'border-red-500/30',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      textColor: 'text-red-500',
      shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
      buttonBg: 'bg-red-600',
      buttonHover: 'hover:bg-red-500',
      buttonShadow: 'shadow-[0_0_15px_rgba(220,38,38,0.4)]',
      buttonHoverShadow: 'hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]',
    },
    success: {
      border: 'border-green-500/50',
      bg: 'bg-[#1a1812]',
      headerBg: 'bg-green-950/30',
      headerBorder: 'border-green-500/30',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      textColor: 'text-green-500',
      shadow: 'shadow-[0_0_40px_rgba(34,197,94,0.4)]',
      buttonBg: 'bg-green-600',
      buttonHover: 'hover:bg-green-500',
      buttonShadow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]',
      buttonHoverShadow: 'hover:shadow-[0_0_25px_rgba(34,197,94,0.6)]',
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-sm overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.shadow} animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${style.headerBorder} ${style.headerBg} p-4`}>
          <h3 className={`flex items-center gap-2 text-lg font-bold ${style.textColor}`}>
            <span className="material-symbols-outlined">{icon}</span>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
            <span className="material-symbols-outlined text-4xl">{icon}</span>
          </div>
          <p className="text-[var(--color-text-body)] whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-[var(--color-chat-dark)] p-4">
          <button
            onClick={handleConfirm}
            className={`flex-1 rounded-lg ${style.buttonBg} py-3 font-bold text-black ${style.buttonShadow} transition-all ${style.buttonHover} ${style.buttonHoverShadow} active:scale-[0.98]`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
