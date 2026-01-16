import React from 'react';
import Avatar from './Avatar';
import Badge from './Badge';

export default function TeamLeaderCard({ captainName = "Hide on bush", tier = "challenger", mainRole = "MID", teamNumber = 1 }) {
  const tierLower = tier.toLowerCase();
  // CSS 변수 참조
  const tierColor = `var(--color-tier-${tierLower}-bg)`;
  const tierText = `var(--color-tier-${tierLower}-text)`; // 배지 텍스트용 (밝은색일 수도 있음)
  
  // 메인 텍스트 색상은 배지 배경색(브랜드 컬러)을 따라감 (단, 텍스트가 잘 보이도록 조정 필요할 수 있음)
  // 여기서는 기존 로직대로 '색상'을 텍스트 색으로 사용
  
  return (
    <div 
        className="w-64 min-h-[22rem] bg-[#1e2328] rounded-2xl border relative overflow-hidden flex flex-col items-center pt-10 pb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] group hover:scale-105 transition-transform duration-300"
        style={{ borderColor: tierColor }}
    >
      
      {/* 상단 배너 (티어 배지) */}
      <div className="absolute top-6 left-6 z-10">
        <span 
            className="text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider"
            style={{ 
                backgroundColor: tierColor,
                color: tierText 
            }}
        >
            {tier}
        </span>
      </div>

      {/* 원형 배경 장식 */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border blur-xl pointer-events-none"
        style={{ 
            borderColor: tierColor, 
            backgroundColor: tierColor,
            opacity: 0.05 
        }}
      ></div>

      {/* 메인 콘텐츠 영역 (중앙 정렬하되 푸터는 아래로 밀어냄) */}
      <div className="flex-1 flex flex-col items-center w-full mt-4">
        
        {/* 아바타 컨테이너 */}
        <div className="relative mb-6">
            <div 
                className="absolute inset-0 rounded-full border-2 animate-pulse-slow"
                style={{ borderColor: tierColor, opacity: 0.5 }}
            ></div>
            {/* 플레이스홀더 이미지 */}
            <Avatar size="xl" tier={tier} src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Faker.png" />
        </div>

        {/* 이름 */}
        <h3 className="text-2xl font-black text-white tracking-tight mb-1">{captainName}</h3>
        <p 
            className="font-bold text-xs tracking-[0.2em] mb-4 uppercase"
            style={{ color: tierColor }}
        >
            Team Captain #{teamNumber}
        </p>

        {/* 주 포지션 */}
        <div className="flex items-center gap-2 mt-2">
            {/* 단순 포지션 아이콘 플레이스홀더 */}
            <span className="material-symbols-outlined" style={{ color: tierColor }}>grid_view</span> 
            <span className="text-sm font-bold text-white/60">MAIN: {mainRole}</span>
        </div>
      </div>
      
      {/* 하단 장식 바 (챔피언 아이콘) */}
      {/* absolute 위치 대신 flex 레이아웃으로 변경하여 자연스럽게 하단에 배치 */}
      <div className="flex gap-2 mt-6">
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/10 bg-cover bg-center" style={{backgroundImage: "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Orianna.png')"}}></div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/10 bg-cover bg-center" style={{backgroundImage: "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Azir.png')"}}></div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/10 bg-cover bg-center" style={{backgroundImage: "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sylas.png')"}}></div>
      </div>
    </div>
  );
}
