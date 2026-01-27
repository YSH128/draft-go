import React from 'react';
import Button from '../ui/Button';

export default function CodeGenerationModal({ isOpen, onClose, codes, onRefresh }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-[480px] bg-[#1a1812] border border-[#393528] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn"
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
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-4 pr-12 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold tracking-wider text-lg"
                    />
                    <button 
                        onClick={() => onRefresh('LEADER')}
                        className="absolute inset-y-0 right-2 flex items-center justify-center w-10 text-[#555] hover:text-[#f4c025] transition-colors"
                        title="코드 재발급"
                    >
                         <span className="material-symbols-outlined">refresh</span>
                    </button>
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
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-4 pr-12 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold tracking-wider text-lg"
                    />
                    <button 
                         onClick={() => onRefresh('MEMBER')}
                        className="absolute inset-y-0 right-2 flex items-center justify-center w-10 text-[#555] hover:text-[#f4c025] transition-colors"
                        title="코드 재발급"
                    >
                         <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <Button 
                variant="primaryStatic" 
                size="full" 
                onClick={onClose}
                className="!font-black !text-lg !rounded-lg !py-4 shadow-lg transition-all"
            >
                <span className="material-symbols-outlined font-bold">check</span>
                확인
            </Button>

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
