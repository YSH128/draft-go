import React from 'react';
import Avatar from './Avatar';

export default function DraftMemberCard({ 
  playerName = "Top King", 
  role = "TOP", 
  tier = "DIAMOND",
  imageSrc = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jayce.png" // 플레이스홀더 또는 props
}) {
  return (
    <div className="w-full max-w-sm h-20 bg-[#091420] rounded-xl border border-[#c89b3c]/50 flex items-center px-4 gap-4 overflow-hidden group hover:border-[#f4c025] hover:shadow-[0_0_15px_rgba(200,155,60,0.3)] transition-all">
      
      {/* 아바타 (둥근 모서리 사각형) */}
      <div className="relative w-12 h-12 flex-shrink-0">
          <div className="absolute inset-0 border border-[#c89b3c] rounded-lg pointer-events-none z-10"></div>
          <img src={imageSrc} alt={playerName} className="w-full h-full object-cover rounded-lg" />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col flex-1 pl-2">
          {/* 이름 */}
          <h3 className="text-white text-lg font-black tracking-tight">{playerName}</h3>
          
          {/* 보조 정보 (포지션 / 티어) */}
          <p className="text-[#c89b3c]/80 text-xs font-bold mt-0.5">
            {role} <span className="mx-1 opacity-50">/</span> {tier}
          </p>
      </div>

    </div>
  );
}
