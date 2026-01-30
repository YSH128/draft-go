
import React, { useState } from "react";
import Button from "../ui/Button";

export default function TeamLeaderSettingsModal({ isOpen, onClose, captain, onSave, pool = [] }) {
  const [selectedLeader, setSelectedLeader] = useState(captain?.name || "");
  const [leaderPoint, setLeaderPoint] = useState(captain?.leaderPoint || 0);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave && onSave(captain.id, { name: selectedLeader, point: leaderPoint });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center font-sans animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#1e2328] border border-[#C89B3C]/30 rounded-lg shadow-2xl shadow-black overflow-hidden transform transition-all scale-100">
        
        {/* Header Section */}
        <div className="p-8 pb-6 bg-gradient-to-b from-[#1e2328] to-[#11161d]">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-[#C89B3C] text-3xl">vpn_key</span>
              <h2 className="text-2xl font-bold text-white tracking-wide">팀장 설정</h2>
            </div>
            <p className="text-[#A09B8C] text-sm text-center font-medium opacity-80">관리자 전용 설정입니다.</p>
          </div>

          <div className="space-y-6">
            {/* Field 1: Change Leader */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 ml-1">
                    팀장 변경
                </label>
                <div className="relative">
                    <select 
                        value={selectedLeader}
                        onChange={(e) => setSelectedLeader(e.target.value)}
                        className="w-full rounded-md py-3 px-4 text-gray-100 appearance-none bg-[#091428] border border-[#3c3c41] focus:border-[#C89B3C] focus:shadow-[0_0_8px_rgba(200,155,60,0.3)] outline-none transition-all duration-300"
                    >
                        {captain?.name ? (
                            <option value={captain.name}>{captain.name} (현재 팀장)</option>
                        ) : (
                            <option value="">팀장을 선택해주세요</option>
                        )}
                        {pool.map((player) => (
                           <option key={player.name} value={player.name}>
                              {player.name} ({player.tier})
                           </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#C89B3C]">
                        <span className="material-symbols-outlined text-xl">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Field 2: Edit Points */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 ml-1">
                    팀장 포인트 수정
                </label>
                <div className="relative">
                    <input 
                        type="number"
                        value={leaderPoint}
                        onChange={(e) => setLeaderPoint(e.target.value)}
                        className="w-full rounded-md py-3 px-4 text-gray-100 bg-[#091428] border border-[#3c3c41] focus:border-[#C89B3C] focus:shadow-[0_0_8px_rgba(200,155,60,0.3)] outline-none transition-all duration-300 placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        placeholder="0" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#A09B8C] text-sm">
                        P
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <Button 
                variant="primaryStatic" 
                size="full" 
                onClick={handleSave}
                className="mt-8 !py-3.5 !rounded !font-black !text-lg transition-all"
            >
                <span>설정 완료</span>
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
            </Button>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-[#091428] px-6 py-3 border-t border-[#3c3c41] flex justify-between items-center text-xs text-[#A09B8C]">
            <span className="font-medium tracking-wide">DRAFT-GO</span>
            <div className="flex items-center gap-1.5 opacity-70">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Admin Only</span>
            </div>
        </div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
            <span className="material-symbols-outlined">close</span>
        </button>

      </div>
    </div>
  );
}
