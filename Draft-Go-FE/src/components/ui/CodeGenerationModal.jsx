import React, { useState } from 'react';
import Button from '../ui/Button';

export default function CodeGenerationModal({ isOpen, onClose, codes, onRefresh }) {
  const [isLeaderCopied, setIsLeaderCopied] = useState(false);
  const [isMemberCopied, setIsMemberCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (code, type) => {
    try {
      await navigator.clipboard.writeText(code);

      // 아이콘 변경 피드백
      if (type === 'LEADER') {
        setIsLeaderCopied(true);
        setTimeout(() => setIsLeaderCopied(false), 2000);
      } else {
        setIsMemberCopied(true);
        setTimeout(() => setIsMemberCopied(false), 2000);
      }

      // Toast 표시
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-[480px] bg-[#1a1812] border border-[#393528] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Padding Container */}
        <div className="p-8 pb-10 flex flex-col">

            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#f4c025] text-4xl font-bold">key</span>
                <h2 className="text-white text-3xl font-black tracking-tight font-display">초대 코드 관리</h2>
            </div>

            {/* Input 1: Team Leader */}
            <div className="mb-6">
                <label className="block text-[#bab29c] text-sm font-bold mb-2 ml-1">팀장용 초대 코드</label>
                <div className="relative">
                    <input
                        type="text"
                        value={codes.teamLeaderCode}
                        readOnly
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-4 pr-28 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold tracking-wider text-lg"
                    />
                    <div className="absolute inset-y-0 right-0 h-full flex items-center pr-2">
                        <div className="w-px h-6 bg-[#393528] mx-2"></div>
                        <button
                            onClick={() => handleCopy(codes.teamLeaderCode, 'LEADER')}
                            className={`p-2 rounded-md transition-all ${isLeaderCopied ? 'text-green-500' : 'text-[#555] hover:text-[#f4c025] hover:bg-white/10'}`}
                            title="코드 복사"
                            aria-label="팀장용 초대 코드 복사"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {isLeaderCopied ? 'check' : 'content_copy'}
                            </span>
                        </button>
                        <button
                            onClick={() => onRefresh('LEADER')}
                            className="p-2 rounded-md text-[#555] hover:text-[#f4c025] hover:bg-white/10 transition-all"
                            title="코드 재발급"
                            aria-label="팀장용 초대 코드 재발급"
                        >
                            <span className="material-symbols-outlined text-xl">sync</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Input 2: Crew */}
            <div className="mb-8">
                <label className="block text-[#bab29c] text-sm font-bold mb-2 ml-1">팀원용 초대 코드</label>
                <div className="relative">
                    <input
                        type="text"
                        value={codes.teamMemberCode}
                        readOnly
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-4 pr-28 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold tracking-wider text-lg"
                    />
                    <div className="absolute inset-y-0 right-0 h-full flex items-center pr-2">
                        <div className="w-px h-6 bg-[#393528] mx-2"></div>
                        <button
                            onClick={() => handleCopy(codes.teamMemberCode, 'MEMBER')}
                            className={`p-2 rounded-md transition-all ${isMemberCopied ? 'text-green-500' : 'text-[#555] hover:text-[#f4c025] hover:bg-white/10'}`}
                            title="코드 복사"
                            aria-label="팀원용 초대 코드 복사"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {isMemberCopied ? 'check' : 'content_copy'}
                            </span>
                        </button>
                        <button
                            onClick={() => onRefresh('MEMBER')}
                            className="p-2 rounded-md text-[#555] hover:text-[#f4c025] hover:bg-white/10 transition-all"
                            title="코드 재발급"
                            aria-label="팀원용 초대 코드 재발급"
                        >
                            <span className="material-symbols-outlined text-xl">sync</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={onClose}
                className="w-full h-14 bg-[#f4c025] hover:brightness-110 text-[#0f0e0b] font-black text-lg rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                <span className="material-symbols-outlined text-xl font-bold">check</span>
                닫기
            </button>

        </div>

        {/* Toast Message */}
        <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-20 px-4 py-2.5 bg-black/90 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
                showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            초대 코드가 복사되었습니다.
        </div>

        {/* Footer */}
        <div className="bg-[#0f0e0b] border-t border-[#393528] px-6 py-4 flex items-center justify-between text-[#555] text-xs font-bold uppercase tracking-wider">
            <span>Draft-Go</span>
            <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Admin Only</span>
            </div>
        </div>

      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
