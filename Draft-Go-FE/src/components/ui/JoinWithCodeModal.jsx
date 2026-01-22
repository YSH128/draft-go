import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import PositionIcon from '../ui/PositionIcon';
import { ROUTES } from '../../constants/routes';

export default function JoinWithCodeModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  // Local state
  const [code, setCode] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null); // 'TOP', 'JNG', 'MID', 'ADC', 'SUP'
  
  const POSITIONS = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];

  if (!isOpen) return null;

  const handleJoin = () => {
    if (!code) {
        alert("참가 코드를 입력해주세요.");
        return;
    }
    if (!selectedPosition) {
        alert("포지션을 선택해주세요.");
        return;
    }

    // Navigate to DraftLobby with state
    navigate(ROUTES.DRAFT_LOBBY, { 
        state: { 
            code, 
            position: selectedPosition, 
            role: 'PLAYER' 
        } 
    });
    onClose();
  };

  const handleSpectatorJoin = () => {
      navigate(ROUTES.DRAFT_LOBBY, { 
          state: { 
              role: 'SPECTATOR' 
          } 
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-[480px] bg-[#1a1812] border border-[#393528] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
            <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Padding Container */}
        <div className="p-8 pb-10 flex flex-col items-center">
            
            {/* Title */}
            <div className="flex flex-col items-center justify-center gap-3 mb-8">
                <div className="size-16 rounded-full bg-[#f4c025]/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[#f4c025] text-4xl font-bold">stadium</span>
                </div>
                <h2 className="text-white text-3xl font-black tracking-tight font-display">드래프트 참가하기</h2>
            </div>

            {/* Input: Code */}
            <div className="w-full mb-6">
                <label className="block text-[#bab29c] text-sm font-bold mb-2 ml-1">팀장/팀원 코드 입력</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[#555]">
                        <span className="material-symbols-outlined text-lg">key</span>
                    </span>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="참가 코드를 입력하세요"
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-12 pr-4 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold placeholder-[#333]"
                    />
                </div>
            </div>

            {/* Position Selection */}
            <div className="w-full mb-8">
                <label className="block text-[#bab29c] text-sm font-bold mb-3 ml-1">포지션 선택</label>
                <div className="flex justify-between gap-2">
                    {POSITIONS.map(pos => (
                        <button
                            key={pos}
                            onClick={() => setSelectedPosition(pos)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border transition-all ${
                                selectedPosition === pos 
                                ? 'bg-[#f4c025] border-[#f4c025] text-black shadow-[0_0_15px_rgba(244,192,37,0.4)]' 
                                : 'bg-[#0f0e0b] border-[#393528] text-[#555] hover:border-[#f4c025] hover:text-[#f4c025]'
                            }`}
                        >
                            <PositionIcon position={pos} className="text-2xl mb-1" />
                            <span className="text-[10px] font-bold tracking-wider">{pos}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <Button 
                variant="primary" 
                size="full" 
                onClick={handleJoin}
                className="!font-black !text-lg !rounded-lg !py-4 shadow-lg hover:brightness-110 mb-4"
            >
                참가하기 🚀
            </Button>
            
            {/* Spectator Link */}
            <button 
                onClick={handleSpectatorJoin}
                className="flex items-center gap-2 text-[#666] hover:text-[#bab29c] transition-colors text-sm font-bold"
            >
                <span className="material-symbols-outlined text-lg">visibility</span>
                관전자로 참여하기
            </button>

        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
