import React from 'react';

export default function KickConfirmModal({ isOpen, onClose, onConfirm, participantName, isSelf = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/50 bg-[#091428] shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/30 bg-red-950/30 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-red-500">
            <span className="material-symbols-outlined">{isSelf ? 'logout' : 'warning'}</span>
            {isSelf ? '나가기 확인' : '참가자 퇴장'}
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
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
             <span className="material-symbols-outlined text-4xl">{isSelf ? 'logout' : 'person_remove'}</span>
          </div>
          <p className="mb-1 text-gray-300">
            {isSelf ? (
                <>로비에서 <span className="font-bold text-white">나가시겠습니까?</span></>
            ) : (
                <><span className="font-bold text-white text-lg">{participantName}</span> 님을</>
            )}
          </p>
          <p className="text-gray-400">
            {isSelf ? '' : '퇴장 시키시겠습니까?'}
          </p>
          <p className="mt-2 text-xs text-red-400/80">
            {isSelf 
                ? '* 나가기 시 홈 화면으로 이동합니다.' 
                : '* 퇴장 시 대기열이나 팀장 슬롯에서 제거됩니다.'
            }
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-[#050c12] p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-600 bg-transparent py-3 font-bold text-gray-400 transition-colors hover:border-gray-400 hover:text-white"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-3 font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-[0.98]"
          >
            {isSelf ? '나가기' : '퇴장'}
          </button>
        </div>
      </div>
    </div>
  );
}
