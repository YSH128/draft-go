import { useState, useEffect } from "react";
import { POSITIONS } from "../../../constants/riot";
import { getTierImage } from "../../../constants/riot";
import TimerCircle from "./TimerCircle";

/**
 * 경매 스테이지
 * - 현재 경매 중인 선수 정보를 표시
 */
export default function AuctionStage({ player, currentBid, hasCurrentBid = false, minBidPrice = 0, timeLeft, highestBidderName, highestBidderColor }) {
  const [visiblePlayer, setVisiblePlayer] = useState(player);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (player) {
      setVisiblePlayer(player);
      setIsExiting(false);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => setVisiblePlayer(null), 500);
      return () => clearTimeout(timer);
    }
  }, [player]);

  if (!visiblePlayer) return null;

  const { name, imageUrl, tier, division, positions = [], mainPosition, subPosition, mostChampions = [] } = visiblePlayer;
  
  // 포지션 ID를 아이콘 URL로 매핑
  const positionIcons = positions
    .filter(Boolean)
    .map(posId => POSITIONS.find(p => p.id === posId?.toUpperCase())?.icon)
    .filter(Boolean);
  
  // 펄스 애니메이션 스타일 주입 - 테두리만 선명하게
  const pulseKeyframes = `
    @keyframes borderPulse {
      0% { 
        box-shadow: 0 0 20px ${highestBidderColor}70, 
                    inset 0 0 12px ${highestBidderColor}30; 
      }
      50% { 
        box-shadow: 0 0 35px ${highestBidderColor}95, 
                    inset 0 0 20px ${highestBidderColor}50; 
      }
      100% { 
        box-shadow: 0 0 20px ${highestBidderColor}70, 
                    inset 0 0 12px ${highestBidderColor}30; 
      }
    }
  `;

  const containerStyle = hasCurrentBid && highestBidderColor
    ? {
        borderColor: highestBidderColor,
        borderWidth: '2px', // 테두리 두께 유지
        // 애니메이션 적용
        animation: 'borderPulse 2s infinite ease-in-out',
      }
    : {};

  const badgeStyle = hasCurrentBid && highestBidderColor
    ? {
        color: highestBidderColor, // 팀 컬러 텍스트
        fontWeight: '900', // 폰트 최대 굵기
        textShadow: `
          0 0 8px rgba(0,0,0,0.9),
          0 0 15px rgba(0,0,0,0.8),
          0 3px 6px rgba(0,0,0,1),
          0 0 25px ${highestBidderColor}90,
          2px 2px 0 rgba(0,0,0,1),
          -2px -2px 0 rgba(0,0,0,1),
          2px -2px 0 rgba(0,0,0,1),
          -2px 2px 0 rgba(0,0,0,1)
        `, // 강한 검은 윤곽선 + 팀 컬러 글로우
        filter: `drop-shadow(0 4px 20px ${highestBidderColor}95)`,
      }
    : {};

  return (
    <>
      <style>{hasCurrentBid && highestBidderColor ? pulseKeyframes : ''}</style>
      <div 
        className={`reactive-border-gold relative w-full max-w-3xl rounded-xl bg-gradient-to-br from-card-dark to-background-dark px-8 pb-8 pt-12 shadow-2xl transition-all duration-500 ease-in-out ${isExiting ? "opacity-0 scale-90 -translate-x-32 blur-sm" : "opacity-100 scale-100 translate-x-0"}`}
        style={containerStyle}
      >
      {/* 포지션 & 티어 정보 (좌측 상단) */}
      <div 
        className="absolute -top-5 left-6 z-10 flex items-center gap-2 rounded-lg bg-gradient-to-br from-card-dark to-background-dark px-4 py-2 shadow-lg border-2 border-primary transition-all duration-300"
        style={containerStyle}
      >
        {/* 포지션 아이콘 + 한글 */}
        <div className="flex items-center gap-1.5">
          {positionIcons[0] && (
            <img
              src={positionIcons[0]}
              alt={positions[0]}
              className="h-6 w-6 opacity-90"
            />
          )}
          <span className="text-md font-bold text-primary-bright">
            {getPositionLabel(positions[0])}
          </span>
        </div>
        <span className="text-primary/40">-</span>
        {/* 티어 아이콘 + 텍스트 */}
        <div className="flex items-center gap-1.5">
          <img 
            src={getTierImage(tier)} 
            alt={tier}
            className="h-6 w-6"
          />
          <span className="text-md font-bold uppercase text-white">
            {tier} {["master", "grandmaster", "challenger"].includes(tier.toLowerCase()) ? "" : division}
          </span>
        </div>
      </div>

      {/* 최고 입찰자 (배경 없이 텍스트만) */}
      {hasCurrentBid && highestBidderName && (
        <div 
          className="absolute right-2 top-2 z-20 px-8 py-4 text-3xl font-black uppercase tracking-wide transition-all duration-300"
          style={badgeStyle}
        >
          {highestBidderName}
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* 좌측: 선수 정보 전체를 세로로 배치 */}
        <div className="flex flex-col gap-6">
          {/* 상단: 프로필 이미지 + 이름 + 선호포지션 (가로 배치) */}
          <div className="flex items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="group relative size-26 shrink-0 rounded-full border-2 border-primary bg-card-dark p-1 shadow-[0_0_15px_rgba(200,155,60,0.3)]">
              <div className="absolute inset-0 animate-ping rounded-full border border-primary/30 opacity-20" />
              <div
                className="size-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
            </div>

            {/* 이름 + 선호포지션 */}
            <div className="flex flex-col gap-3">
              {/* 이름 */}
              <h2 className="text-4xl font-bold uppercase leading-none tracking-tight text-white drop-shadow-lg">
                {name}
              </h2>

              {/* 선호 포지션: 아이콘으로만 표시 */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                  주 포지션:
                </span>
                <div className="flex items-center gap-2">
                  {/* 주 포지션 - 크게 */}
                  {mainPosition && (() => {
                    const mainPosIcon = POSITIONS.find(p => p.id === mainPosition.toUpperCase())?.icon;
                    return mainPosIcon && (
                      <div className="flex items-center justify-center w-12 h-12 rounded bg-card-dark border border-primary/30">
                        <img 
                          src={mainPosIcon} 
                          alt={mainPosition}
                          className="w-9 h-9 opacity-90"
                        />
                      </div>
                    );
                  })()}
                  
                  {/* 서브 포지션 - 작게 */}
                  {subPosition && (() => {
                    const subPosIcon = POSITIONS.find(p => p.id === subPosition.toUpperCase())?.icon;
                    return subPosIcon && (
                      <div className="flex items-center justify-center w-9 h-9 rounded bg-transparent">
                        <img 
                          src={subPosIcon} 
                          alt={subPosition}
                          className="w-6 h-6 opacity-70"
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 모스트 챔피언 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary/60">
                모스트 챔피언
              </span>
              <div className="h-px flex-1 bg-primary/20" />
            </div>
            {mostChampions.length > 0 ? (
              <div className="flex gap-2">
                {mostChampions.slice(0, 3).map((champ, idx) => {
                  const championName = typeof champ === 'string' ? champ : (champ.championName || champ.name);
                  const championIconUrl = typeof champ === 'object' ? (champ.championIconUrl || champ.imageUrl) : null;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`relative ${idx === 0 ? 'w-14 h-14' : 'w-12 h-12'} rounded-full overflow-hidden border-2 ${idx === 0 ? 'border-primary' : 'border-primary/30'} bg-black/40`}>
                        <img
                          src={championIconUrl || `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`}
                          alt={championName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-primary-bright group-hover:text-primary transition-colors">
                        {championName}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs italic text-primary/30">정보 없음</span>
            )}
          </div>
        </div>

        {/* 우측: 타이머 + 입찰가 */}
        <div className="relative flex flex-col mt-auto min-w-[200px] border-l border-primary/10 pl-10">
          <div className="flex items-end justify-end gap-10">

          <TimerCircle seconds={timeLeft} maxSeconds={15} />

          <div className="flex flex-col items-end text-right">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary/60">
              현재 입찰가
            </p>

            {/* 입찰가 있음/없음 구분 */}
            {hasCurrentBid ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="gold-gradient-text text-7xl font-black leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(200,155,60,0.4)]">
                    {currentBid}
                  </span>
                  <span className="text-2xl font-bold uppercase text-primary/60">P</span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold italic text-primary/40">
                  입찰 없음
                </span>
              </div>
            )}

            {/* 최소 입찰가 표시 */}
            {minBidPrice > 0 && (
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary/40">
                  최소 입찰가:
                </span>
                <span className="text-lg font-bold text-primary/60">
                  {minBidPrice}P
                </span>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// 포지션 ID를 한글로 변환
function getPositionLabel(positionId) {
  const positionMap = {
    'TOP': '탑',
    'JUNGLE': '정글',
    'MID': '미드',
    'BOT': '원딜',
    'SUP': '서포터'
  };
  return positionMap[positionId?.toUpperCase()] || positionId;
}

function TierBadge({ tier, division }) {
  const tierLower = tier?.toLowerCase() || "gold";

  const tierStyles = {
    challenger:
      "bg-gradient-to-r from-tier-challenger-bg to-yellow-600 border-primary/50 shadow-[0_0_10px_rgba(244,192,37,0.3)]",
    grandmaster: "bg-tier-grandmaster-bg border-tier-grandmaster-bg/50",
    master: "bg-tier-master-bg border-tier-master-bg/50",
    diamond: "bg-tier-diamond-bg border-tier-diamond-bg/50",
    emerald: "bg-tier-emerald-bg border-tier-emerald-bg/50",
    platinum: "bg-tier-platinum-bg border-tier-platinum-bg/50",
    gold: "bg-tier-gold-bg border-tier-gold-bg/50",
    silver: "bg-tier-silver-bg border-tier-silver-bg/50",
    bronze: "bg-tier-bronze-bg border-tier-bronze-bg/50",
    iron: "bg-tier-iron-bg border-tier-iron-bg/50",
  };

  const style = tierStyles[tierLower] || tierStyles.gold;

  // Division을 로마 숫자로 변환
  const divisionMap = {
    I: "I",
    II: "II",
    III: "III",
    IV: "IV",
  };
  // 마스터 이상은 Division 표시 안 함
  const isApex = ["master", "grandmaster", "challenger"].includes(tier);
  const divisionText = (!isApex && division && divisionMap[division]) 
    ? ` ${divisionMap[division]}` 
    : "";

  return (
    <span
      className={`rounded border px-3 py-1 text-xs font-black uppercase text-white ${style}`}
    >
      {tier}{divisionText}
    </span>
  );
}
