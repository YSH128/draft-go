import React, { useState, useEffect } from 'react';
import Avatar from '../ui/Avatar';
import PositionIcon from '../ui/PositionIcon';

export default function ParticipantProfileModal({ 
  isOpen, 
  onClose, 
  participantData, 
  onRefresh 
}) {
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  
  const data = participantData;
 
  
  // 소환사 라이엇 레벨
  // 소환사 라이엇 레벨
  const tierStr = data?.tier || "Unranked";
  const tierLower = tierStr.toLowerCase();

  // 전적 갱신 시간

  const calculateRemainingTime = React.useCallback(() => {
    if (!data?.lastUpdated) return 0;
    const lastUpdate = new Date(data.lastUpdated).getTime();
    const now = Date.now();
    const elapsed = (now - lastUpdate) / 1000;
    // 쿨타임 120초 (2분)
    return Math.max(0, 120 - Math.floor(elapsed));
  }, [data?.lastUpdated]);



  // Initialize and Interval based on timestamp
  useEffect(() => {
    // Open될 때, 혹은 data가 바뀔 때 초기 계산
    setRefreshCooldown(calculateRemainingTime());

    const timer = setInterval(() => {
        const remaining = calculateRemainingTime();
        setRefreshCooldown(remaining);
        
        if (remaining <= 0) {
            clearInterval(timer);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.lastUpdated, data?.summonerName, calculateRemainingTime]); // Depend on data

  const handleRefresh = async () => {
    if (refreshCooldown > 0 || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh?.();
   
    } catch (error) {
      console.error('소환사 정보 갱신 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[420px] max-h-[90vh] bg-[#091428] border border-primary/50 rounded-xl shadow-[0_0_30px_rgba(200,155,60,0.3)] overflow-hidden flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 심볼 */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* 배경 그라디언트 */}
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#1c3d5e] to-transparent opacity-30 pointer-events-none"></div>

        {/* Header Section */}
        <div className="relative flex flex-col items-center pt-10 pb-6 px-6 z-10">
          {/* 배경 글로우 */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>

          {/* 레벨 */}
          <div className="relative mb-4">
            <div className={`absolute -inset-1 rounded-full opacity-30 blur-md bg-[var(--color-tier-${tierLower}-bg)]`}></div>
            <div 
              className="relative rounded-full border-2 p-1.5 bg-[#010a13] shadow-lg ring-2 ring-offset-2 ring-offset-[#091428]"
              style={{ 
                borderColor: `var(--color-tier-${tierLower}-bg)`,
                ringColor: `var(--color-tier-${tierLower}-bg)`
              }}
            >
              <div className="relative">
                <Avatar
                  size="xl"
                  tier={data.tier}
                  src={data.profileIconUrl}
                  className="w-24 h-24"
                />
                {/* 레벨 배경 */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[10px] text-center py-0.5 font-bold rounded-b-full">
                  LVL {data.level}
                </div>
              </div>
            </div>
            {/* 라인 상태 */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0ac8b9] border-2 border-[#091428] rounded-full shadow-[0_0_10px_#0ac8b9]"></div>
          </div>

          {/* 이름 */}
          <h1 className="text-white text-3xl font-bold tracking-tight mb-1">{data.summonerName}</h1>
          
          {/* 라인 */}
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-primary text-xl">military_tech</span>
            <span className="text-gray-300 font-medium tracking-wide">
              {data.tier} <span className="text-gray-500 mx-1">{data.division}</span> {data.lp} LP
            </span>
          </div>
        </div>

        {/* 통계 그리기 */}
        <div className="px-6 py-2 w-full z-10">
          <div className="grid grid-cols-2 gap-3">
            {/* 전체 승률 */}
            <div className="bg-[#010a13]/50 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">전체 승률</p>
              <div className="flex items-baseline gap-1">
                <span className="text-primary text-2xl font-bold">{data.winRate}%</span>
                {data.winRate >= 50 && <span className="text-[#0ac8b9] text-xs font-bold"></span>}
              </div>
            </div>

            {/* 최근 20게임 */}
            <div className="bg-[#010a13]/50 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">최근 20게임</p>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-xl font-bold">{data.recent20.wins}</span>
                <span className="text-gray-500 text-sm">승</span>
                <span className="text-gray-500 mx-1">-</span>
                <span className="text-white text-xl font-bold">{data.recent20.losses}</span>
                <span className="text-gray-500 text-sm">패</span>
              </div>
            </div>
          </div>
        </div>

        {/* 포지션 */}
        {(data.mainPosition || data.subPosition) && (
          <div className="px-6 py-3 w-full z-10">
            <div className="grid grid-cols-2 gap-3">
              {/* 주포지션 */}
              {data.mainPosition && (
                <div className="bg-[#010a13]/50 border border-white/10 rounded-lg p-3 flex items-center justify-center gap-3 relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <PositionIcon position={data.mainPosition} className="w-8 h-8 relative z-10" />
                  <div className="relative z-10 text-left">
                    <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mb-0.5">주포지션</p>
                    <p className="text-white font-bold text-sm leading-none">
                      {['BOT', 'BOTTOM'].includes(data.mainPosition) ? 'ADC' : data.mainPosition}
                    </p>
                  </div>
                </div>
              )}
              
              {/* 부포지션 */}
              {data.subPosition && (
                <div className="bg-[#010a13]/50 border border-white/10 rounded-lg p-3 flex items-center justify-center gap-3 relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <PositionIcon position={data.subPosition} className="w-8 h-8 relative z-10" />
                  <div className="relative z-10 text-left">
                    <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mb-0.5">부포지션</p>
                    <p className="text-white font-bold text-sm leading-none">
                      {['BOT', 'BOTTOM'].includes(data.subPosition) ? 'ADC' : data.subPosition}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Most Champions */}
        <div className="px-6 py-4 flex-1 flex flex-col z-10">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">trophy</span>
            Most Champions
          </h3>
          <div className="flex flex-col gap-2">
            {data.mostChampions.length > 0 ? (
              data.mostChampions.slice(0, 3).map((champion, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#0c1c33] border border-white/5 rounded-lg hover:bg-[#11233d] transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-600 group-hover:border-primary transition-colors">
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: champion.imageUrl ? `url('${champion.imageUrl}')` : 'none' }}
                      ></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-bold text-sm">{champion.name}</span>
                      <span className="text-gray-500 text-xs">{champion.games} Games</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-sm ${champion.winRate >= 55 ? 'text-primary' : 'text-white'}`}>
                      {champion.winRate}%
                    </span>
                    <span className="text-gray-400 text-xs">{champion.kda} KDA</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                모스트 챔피언이 없습니다.
              </div>
            )}
          </div>
        </div>

        </div>

        {/* Action 버튼 */}
        <div className="p-6 pt-2 z-10 mt-auto w-full">
          <button
            onClick={handleRefresh}
            disabled={refreshCooldown > 0 || isRefreshing}
            className={`w-full relative group overflow-hidden font-bold py-3.5 px-6 rounded-lg transition-all duration-300 ${
              refreshCooldown > 0 || isRefreshing
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-primary hover:bg-[#f0b116] text-[#091428] shadow-[0_0_15px_rgba(250,198,56,0.3)] hover:shadow-[0_0_25px_rgba(250,198,56,0.5)] active:translate-y-0.5'
            }`}
          >
            {refreshCooldown === 0 && !isRefreshing && (
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-shine"></div>
            )}
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-xl">
                {isRefreshing ? 'hourglass_empty' : 'refresh'}
              </span>
              <span>
                {isRefreshing ? '갱신 중...' : refreshCooldown > 0 ? `전적 갱신 (${formatCooldown(refreshCooldown)})` : '전적 갱신'}
              </span>
            </div>
          </button>

          <div className="mt-4 text-center">
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 배경 투명 버튼 */}
        <div className="absolute inset-0 opacity-30 pointer-events-none z-0" style={{ 
          backgroundColor: '#091428',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200, 155, 60, 0.05) 0%, transparent 50%)'
        }}></div>
      </div>
    </div>
  );
}
