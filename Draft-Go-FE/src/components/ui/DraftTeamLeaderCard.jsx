import React from 'react';

// 팀 색상 매핑
const teamColors = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#00d084",
  purple: "#a855f7",
  orange: "#fb923c",
  skyblue: "#38bdf8",
  gold: "#f4c025"
};

export default function DraftTeamLeaderCard({ 
  teamName = "Green Delta", 
  points = 800, 
  color = "green", 
  status = "bidding" // bidding, waiting, completed
}) {
  const activeColor = teamColors[color] || teamColors.gold;
  
  // 상태 로직
  const isBidding = status === 'bidding';
  
  return (
    <div 
        className="relative w-full max-w-sm h-20 bg-[#091420] rounded-lg border flex items-center overflow-hidden group hover:bg-[#151a23] transition-colors"
        style={{ borderColor: activeColor }}
    >
      
      {/* 왼쪽 굵은 바 (상태 표시기) */}
      <div 
        className="h-full w-2.5" 
        style={{ backgroundColor: activeColor }}
      ></div>
      
      {/* 콘텐츠 영역 */}
      <div className="flex-1 flex justify-between items-center px-4 py-3">
        
        {/* 왼쪽: 팀 정보 */}
        <div className="flex flex-col">
            <h3 className="text-white text-lg font-bold leading-tight tracking-tight">{teamName}</h3>
            <p className="text-[#f4c025] text-xs font-bold mt-1">
                보유 포인트: <span className="text-[#f0e6d2]">{points} P</span>
            </p>
        </div>

        {/* 오른쪽: 상태 아이콘 */}
        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
            {isBidding ? (
                <>
                    <span className="material-symbols-outlined text-[#f4c025] animate-pulse">psychology</span>
                    <span className="text-[10px] text-[#f4c025] font-bold">입찰중</span>
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-gray-600">hourglass_empty</span>
                    <span className="text-[10px] text-gray-600 font-bold">대기</span>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
