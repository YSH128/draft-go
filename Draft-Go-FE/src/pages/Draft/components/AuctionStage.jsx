import { POSITIONS } from "../../../constants/riot";
import TimerCircle from "./TimerCircle";

/**
 * 경매 스테이지
 * - 현재 경매 중인 선수 정보를 표시
 */
export default function AuctionStage({ player, currentBid, timeLeft }) {
  if (!player) return null;

  const { name, imageUrl, tier, division, positions = [], mainPosition, subPosition, mostChampions = [] } = player;
  const positionIcons = positions
    .map((pos) => POSITIONS.find((item) => item.id === String(pos || "").toUpperCase())?.icon)
    .filter(Boolean);

  return (
    <div className="reactive-border-gold relative w-full max-w-5xl rounded-xl bg-gradient-to-br from-card-dark to-background-dark p-8 shadow-2xl">
      <div className="absolute -top-3 left-8 z-10 rounded-full bg-primary px-4 py-0.5 text-[10px] font-black uppercase tracking-widest text-background-dark shadow-[0_0_10px_rgba(200,155,60,0.4)]">
        현재 경매 진행 중
      </div>

      <div className="flex items-center justify-between">
        {/* 좌측: 선수 정보 */}
        <div className="flex items-center gap-8">
          <div className="group relative size-36 shrink-0 rounded-full border-2 border-primary bg-card-dark p-1 shadow-[0_0_20px_rgba(200,155,60,0.3)]">
            <div className="absolute inset-0 animate-ping rounded-full border border-primary/30 opacity-20" />
            <div
              className="size-full rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url('${imageUrl}')` }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-bold uppercase leading-none tracking-tight text-white drop-shadow-lg">
              {name}
            </h2>

            <div className="flex items-center gap-3">
              <TierBadge tier={tier} division={division} />
              <span className="text-primary/30">/</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {positionIcons.map((icon, index) => (
                    <img
                      key={`${icon}-${index}`}
                      src={icon}
                      alt={positions[index]}
                      className="h-4 w-4 opacity-90"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-primary-bright">
                  {positions.join(" / ")}
                </span>
              </div>
            </div>

            {/* 참고 정보: 선호 포지션 */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/50">
                선호 포지션:
              </span>
              {mainPosition || subPosition ? (
                <div className="flex items-center gap-1.5">
                  {mainPosition && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-bright">
                      주: {mainPosition}
                    </span>
                  )}
                  {subPosition && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary/70">
                      부: {subPosition}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] italic text-primary/30">정보 없음</span>
              )}
            </div>

            {/* 참고 정보: 모스트 챔피언 */}
            <div className="mt-1.5 flex items-start gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/50">
                모스트:
              </span>
              {mostChampions.length > 0 ? (
                <div className="flex gap-1.5">
                  {mostChampions.map((champ, idx) => {
                    // mostChampions가 객체 배열인 경우와 문자열 배열인 경우 모두 처리
                    const championName = typeof champ === 'string' ? champ : (champ.championName || champ.name);
                    const championIconUrl = typeof champ === 'object' ? (champ.championIconUrl || champ.imageUrl) : null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5"
                        title={championName}
                      >
                        <img
                          src={championIconUrl || `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`}
                          alt={championName}
                          className="h-4 w-4 rounded-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="text-[10px] font-medium text-white/80">
                          {championName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[10px] italic text-primary/30">정보 없음</span>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 타이머 + 입찰가 */}
        <div className="flex min-w-[200px] items-center justify-end gap-10 border-l border-primary/10 pl-10">
          <TimerCircle seconds={timeLeft} maxSeconds={30} />

          <div className="flex flex-col items-end text-right">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
              현재 입찰가
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="gold-gradient-text text-5xl font-black leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(200,155,60,0.3)]">
                {currentBid}
              </span>
              <span className="text-lg font-bold uppercase text-primary/60">P</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const divisionText = division && divisionMap[division] ? ` ${divisionMap[division]}` : "";

  return (
    <span
      className={`rounded border px-3 py-1 text-xs font-black uppercase text-white ${style}`}
    >
      {tier}{divisionText}
    </span>
  );
}
