import React from "react";
import Avatar from "../ui/Avatar";
import PositionIcon from "../ui/PositionIcon";

export default function TeamLeaderCard({
  captainName = "Hide on bush",
  tier = "challenger",
  points = 1000,
  // mainRole = "MID", // Removed to fix lint
  teamNumber = 1,
  // New Props
  isAdmin = false,
  isCurrentUser = false,
  isReady = false,
  selectedRole = null, // 'TOP', 'JNG', 'MID', 'ADC', 'SUP'
  onRoleSelect = () => {},
  onReadyClick = () => {},
  onOpenSettings = () => {},
  onCardClick = null, // 카드 클릭 (CAPTAIN/CREW)
  mostChampions = [], // 모스트 챔피언 (최대 3개)
  onKick = null, // 퇴장 버튼 클릭 (ADMIN only)
}) {
  const tierLower = tier.split(" ")[0].toLowerCase();
  // CSS 변수 참조
  const tierColor = `var(--color-tier-${tierLower}-bg)`;
  const tierBadgeText = `var(--color-tier-${tierLower}-badge-text)`;

  // --- State Logic ---
  // 1. Selection State: Captain (Self) AND Not Ready
  // 2. Ready State: Ready is true
  // 3. Waiting State: Ready is false AND (Not Captain OR Position not selected)
  
  // Actually, let's simplify based on the UI requirement:
  // If isCurrentUser and !isReady: Show Selection UI (Yellow card style functionality)
  // If isReady: Show Ready Banner (Red style functionality)
  // If !isReady and (!isCurrentUser): Show Waiting Banner (Purple style functionality)

  return (
    <div
      className={`group relative flex min-h-[460px] w-full max-w-[340px] flex-col items-center overflow-hidden rounded-2xl border bg-panel-dark pt-10 pb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.02] ${onCardClick ? 'cursor-pointer' : ''}`}
      style={{ borderColor: tierColor }}
      onClick={onCardClick || undefined}
    >
      {/* Admin Control (Top Right) - Settings */}
      {(isAdmin) && (
        <button 
            onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
            }}
            className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white transition-colors"
            title="팀 설정"
        >
            <span className="material-symbols-outlined">settings</span>
        </button>
      )}

      {/* Admin Control (Top Left) - Kick/Leave */}
      {(isAdmin || isCurrentUser) && (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                if (onKick) onKick(isCurrentUser);
            }}
            className="absolute top-4 left-4 z-20 size-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
            title={isCurrentUser ? "나가기" : "참가자 퇴장"}
        >
            <span className="material-symbols-outlined text-lg font-bold">close</span>
        </button>
      )}


      {/* 상단 심볼 */}
      <div className="absolute top-6 left-6 z-10 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
        <span
          className="rounded-sm px-2.5 py-1 text-[10px] font-black tracking-wider uppercase shadow-sm"
          style={{
            backgroundColor: tierColor,
            color: tierBadgeText,
          }}
        >
          {tier}
        </span>
      </div>

      {/* 티어 배경 심볼 */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border blur-2xl"
        style={{
          borderColor: tierColor,
          backgroundColor: tierColor,
          opacity: 0.1,
        }}
      ></div>

      {/* 메인 콘텐츠 */}
      <div className="mt-4 flex w-full flex-1 flex-col items-center px-6">
        {/* 포지션 컨테이너 */}
        <div className="relative mb-6">
          <div
            className="absolute -inset-1 rounded-full opacity-30 blur-md"
            style={{ backgroundColor: tierColor }}
          ></div>
          <div
            className="relative rounded-full border-2 p-1.5"
            style={{ borderColor: `${tierColor}4D` }} // 30% opacity
          >
             <Avatar
                size="xl"
                tier={tier}
                src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Faker.png"
                className="w-24 h-24"
              />
          </div>
        </div>

        {/* ?�름 */}
        <div className="text-center mb-5 w-full">
            <p className="text-[#C89B3C] font-bold text-sm mb-1">{points} p</p>
            <h3 className="mb-0.5 text-xl font-bold text-white">
            {captainName}
            </h3>
            <p
            className="mb-4 text-[11px] font-bold tracking-[0.2em] uppercase opacity-90"
            style={{ color: tierColor }}
            >
            Team Captain #{teamNumber} {isCurrentUser && "(Me)"}
            </p>

            {/* --- Dynamic Content Area --- */}
            
            {/* Case 1: Selection Phase (Current User & Not Ready) */}
            {isCurrentUser && !isReady ? (
                <div className="bg-[#0f0e0b] rounded-xl p-3 border border-[#393528] shadow-inner w-full animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[#bab29c] text-[10px] font-bold uppercase">포지션 선택</p>
                        <span className="text-[10px] font-bold" style={{ color: tierColor }}>{selectedRole || '미선택'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        {['TOP', 'JNG', 'MID', 'ADC', 'SUP'].map((role) => (
                            <button 
                                key={role}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoleSelect(role);
                                }}
                                className={`flex-1 aspect-square rounded border flex items-center justify-center transition-all ${selectedRole === role ? 'pos-icon-active shadow-[0_0_10px_rgba(244,192,37,0.2)]' : 'border-[#393528] bg-[#181611] text-[#666] hover:border-[#bab29c] hover:bg-[#2a261a]'}`}
                                style={selectedRole === role ? { borderColor: tierColor, color: tierColor, background: `${tierColor}26` } : {}}
                                title={role}
                            >
                                <PositionIcon position={role} className="text-lg" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Case 2 & 3: View Mode (Ready or Waiting) */
                 <div className="flex flex-col items-center justify-center bg-[#0f0e0b] border border-[#393528] py-4 rounded-xl shadow-inner w-full opacity-90">
                    {selectedRole ? (
                        <>
                            <PositionIcon position={selectedRole} className="text-3xl mb-1 drop-shadow-md" style={{ color: tierColor}} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: tierColor }}>{selectedRole} 선택</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[#bab29c] text-3xl mb-1">help</span>
                            <span className="text-[#bab29c] text-[10px] font-bold uppercase tracking-[0.1em]">포지션 미선택</span>
                        </>
                    )}
                </div>
            )}
        </div>
        
        {/* --- Action / Status Button --- */}
        {isCurrentUser && !isReady ? (
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onReadyClick();
                }}
                disabled={!selectedRole}
                className={`w-full text-black text-sm font-black py-3 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all uppercase shadow-lg shadow-black/40 tracking-wider hover:brightness-110 ${!selectedRole ? 'opacity-50 cursor-not-allowed bg-gray-600' : ''}`}
                style={{ background: `linear-gradient(to right, ${tierColor}, #e8b948)` }}
             >
                <span className="material-symbols-outlined text-lg">check_circle</span> 준비 완료
            </button>
        ) : isReady ? (
            isCurrentUser ? (
                <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadyClick();
                    }}
                    className="group/ready w-full bg-gradient-to-r from-hextech-gold/10 to-transparent border border-hextech-gold/40 text-hextech-gold text-sm font-black py-2.5 rounded-lg mb-4 flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_10px_rgba(200,155,60,0.1)] cursor-pointer hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Click to Cancel Ready"
                >
                    <span className="material-symbols-outlined text-lg group-hover/ready:hidden">task_alt</span>
                    <span className="group-hover/ready:hidden">READY</span>
                    <span className="hidden group-hover/ready:inline">CANCEL</span>
                </button>
            ) : (
                <div className="w-full bg-gradient-to-r from-hextech-gold/10 to-transparent border border-hextech-gold/40 text-hextech-gold text-sm font-black py-2.5 rounded-lg mb-4 flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_10px_rgba(200,155,60,0.1)]">
                    <span className="material-symbols-outlined text-lg">task_alt</span> READY
                </div>
            )
        ) : (
             <div className="w-full bg-[#181611] border border-[#393528] text-[#bab29c] text-sm font-black py-2.5 rounded-lg mb-4 flex items-center justify-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined text-lg">schedule</span> WAITING
            </div>
        )}

      </div>

      {/* 모스트 챔피언 */}
      <div className="flex justify-center gap-3 w-full border-t border-[#393528] pt-4 mt-auto px-6">
        {mostChampions.length > 0 ? (
          mostChampions.slice(0, 3).map((champion, idx) => (
            <div 
              key={idx} 
              className="size-9 rounded bg-[#2a261a] border border-[#393528] flex items-center justify-center overflow-hidden hover:border-primary transition-colors cursor-help relative group"
              title={`${champion.name} - ${champion.games}게임, ${champion.winRate}%`}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: champion.imageUrl ? `url('${champion.imageUrl}')` : 'none',
                  backgroundColor: champion.imageUrl ? 'transparent' : '#2a261a'
                }}
              ></div>
              {/* Hover overlay with champ name */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[8px] text-white font-bold text-center px-1">{champion.name}</span>
              </div>
            </div>
          ))
        ) : (
          // Placeholder if no champion data
          [1, 2, 3].map((i) => (
            <div key={i} className="size-9 rounded bg-[#2a261a] border border-[#393528] flex items-center justify-center overflow-hidden opacity-50">
              <div className="w-full h-full" style={{ backgroundColor: '#2a261a' }}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
