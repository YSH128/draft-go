import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';

export default function ActiveBidderCard({ 
  playerName = "Challenger Player", 
  tier = "challenger", 
  role = "탑 / 정글", 
  initialPoints = 240,
  championImages = [
    "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jayce.png",
    "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png",
    "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kayle.png"
  ]
}) {
  const [timeLeft, setTimeLeft] = useState(10);
  const currentPoints = initialPoints;
  const maxTime = 10;
  
  // 타이머 로직
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1)); // 0.1초 단위로 감소 부드러운 효과
    }, 100);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((timeLeft / maxTime) * circumference);

  return (
    <div className="w-full max-w-4xl h-80 bg-card-dark rounded-3xl border-2 border-hextech-gold flex items-center relative px-12 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* 좌측 상단 배지 */}
        <div className="absolute top-0 left-12 -translate-y-1/2">
             <Badge variant="bid" className="px-6 py-2 text-sm rounded-full border-2 border-card-dark">현재 입찰 1위</Badge>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="flex w-full items-center justify-between">
            
            {/* 좌측: 플레이어 아바타 */}
            <div className="relative">
                {/* 골드 원형 오버레이 */}
                <div className="absolute inset-0 rounded-full border-[3px] border-hextech-gold scale-110 shadow-[0_0_20px_rgba(200,155,60,0.4)]"></div>
                <Avatar size="xl" tier={tier} src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jayce.png" className="w-48 h-48 !border-none" />
            </div>

            {/* 중앙: 플레이어 정보 */}
            <div className="flex flex-col flex-1 px-12">
                <h2 className="text-5xl font-black text-white tracking-tight mb-2">{playerName}</h2>
                
                <div className="flex items-center gap-4 mb-8">
                    <div 
                        className="px-3 py-1 border rounded font-bold text-sm bg-opacity-20 flex items-center justify-center transition-colors"
                        style={{ 
                            borderColor: `var(--color-tier-${tier.toLowerCase()}-bg)`, 
                            color: `var(--color-tier-${tier.toLowerCase()}-bg)`,
                            backgroundColor: `var(--color-tier-${tier.toLowerCase()}-bg)` 
                        }}
                    >
                        <span className="brightness-150 filter" style={{color: '#fff'}}>{tier.toUpperCase()} 티어</span> {/* Text White for solid bg */}
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    <span className="text-gray-400 font-bold text-xl">{role}</span>
                </div>

                {/* 챔피언 풀 */}
                <div className="flex gap-3">
                    {championImages.map((src, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-full border-2 border-[var(--color-border-subtle)] overflow-hidden bg-black">
                            <img src={src} alt="champ" className="w-full h-full object-cover opacity-80" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 우측: 타이머 및 입찰 정보 */}
            <div className="flex flex-col items-center">
                
                {/* 타이머 원 */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    {/* SVG 진행 링 */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                        {/* 배경 원 */}
                        <circle cx="40" cy="40" r={radius} stroke="var(--color-card-bg)" strokeWidth="3" fill="none" />
                        {/* 진행 원 (노란색) */}
                        {/* SVG 원형 계산 */}
                        <circle 
                            cx="40" cy="40" r={radius} 
                            stroke="var(--color-primary)" strokeWidth="3" fill="none" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-100 ease-linear"
                        />
                    </svg>
                    
                    {/* 타이머 텍스트 */}
                    <span className={`text-4xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-hextech-gold-bright'}`}>
                        {Math.ceil(timeLeft)}
                    </span>
                </div>

                {/* 포인트 표시 */}
                <div className="text-center">
                    <p className="text-gray-500 text-xs font-bold mb-1 tracking-widest uppercase">현재 입찰가</p>
                    <p className="text-6xl font-black text-primary flex items-baseline gap-1" style={{textShadow: '0 0 30px rgba(244,192,37,0.3)'}}>
                        {currentPoints} <span className="text-2xl text-gray-400">P</span>
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
}
