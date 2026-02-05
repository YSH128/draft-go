import React from 'react';
import Button from '../../../components/ui/Button';

export default function LobbyFooterSection({
    isHost,
    captains,
    onDestroyClick,
    onStartClick
}) {
    const allCaptainsReady = captains.filter(c => c.name).every(c => c.ready);

    return (
        <div className="flex justify-end pt-4 gap-3" style={{ marginBottom: '1px' }}>
            {/* 로비 닫기 버튼 */}
            {isHost && (
                <button
                    onClick={onDestroyClick}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#1a1812] hover:bg-red-900/20 text-red-500 font-bold text-base border-2 border-red-900/30 hover:border-red-500/50 transition-all"
                    title="로비를 닫고 모든 참가자를 퇴장시킵니다"
                >
                    <span className="material-symbols-outlined font-bold">meeting_room</span>
                    로비 닫기
                </button>
            )}

            {isHost ? (
                <Button
                    variant="bid"
                    disabled={!allCaptainsReady}
                    onClick={onStartClick}
                    className={`!h-14 !px-8 !text-xl !rounded-xl gap-2 !flex-row flex items-center justify-center transition-all duration-300 ${
                        allCaptainsReady
                            ? 'shadow-[0_0_20px_rgba(200,155,60,0.4)] hover:brightness-110 cursor-pointer opacity-100'
                            : 'shadow-none cursor-not-allowed opacity-50'
                    }`}
                >
                    <span className="material-symbols-outlined font-bold text-2xl">gavel</span>
                    <span>경매 시작하기</span>
                </Button>
            ) : (
                <div className="bg-[#0f0e0b] border border-[#393528] rounded-xl px-6 py-4 flex items-center gap-4 shadow-xl">
                    <span className={`material-symbols-outlined text-[#c89b3c] text-2xl ${
                        allCaptainsReady ? 'animate-pulse' : 'animate-spin-slow'
                    }`}>
                        {allCaptainsReady ? 'hourglass_top' : 'sync'}
                    </span>
                    <div>
                        <p className="text-[#c89b3c] text-xs font-bold uppercase tracking-widest mb-0.5">SYSTEM</p>
                        <p className="text-white font-bold text-sm text-opacity-80">
                            {allCaptainsReady
                                ? "관리자의 시작을 기다리는 중..."
                                : "팀장들의 준비를 기다리는 중..."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
