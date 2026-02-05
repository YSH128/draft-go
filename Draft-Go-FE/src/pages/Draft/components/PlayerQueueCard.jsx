import { POSITIONS } from "../../../constants/riot";

/**
 * 대기열 플레이어 카드
 *
 * @param {Object} player - 플레이어 정보
 * @param {string} player.name - 이름
 * @param {string} player.imageUrl - 프로필 이미지
 * @param {string} player.tier - 티어
 * @param {string} player.position - 주 포지션
 */
export default function PlayerQueueCard({ player }) {
  const { name, imageUrl, tier, division, position } = player;
  const tierLower = tier?.toLowerCase() || "gold";

  const positionIcon =
    POSITIONS.find((pos) => pos.id === String(position || "").toUpperCase())?.icon || null;

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded p-2.5 transition-colors hover:bg-white/5">
      <div className="flex flex-col items-center gap-2">
        {/* 프로필 이미지 */}
        <div
          className="relative size-14 rounded border border-white/10 bg-cover bg-center transition-colors group-hover:border-primary/50"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />

        {/* 정보 */}
        <div className="w-full text-center">
          {/* 포지션 + 이름 */}
          <div className="mb-1 flex items-center justify-center gap-1">
            {positionIcon && (
              <img
                src={positionIcon}
                alt={position}
                className="h-3 w-3 opacity-80"
              />
            )}
            <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-primary">
              {name}
            </p>
          </div>

          {/* 티어 배지 */}
          <div className="flex justify-center gap-1">
            <TierTag tier={tierLower} division={division} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 티어 태그 (작은 버전)
 */
function TierTag({ tier, division }) {
  const tierStyles = {
    challenger: "bg-tier-challenger-bg text-black",
    grandmaster: "bg-tier-grandmaster-bg text-white",
    master: "bg-tier-master-bg text-white",
    diamond: "bg-tier-diamond-bg text-white",
    emerald: "bg-tier-emerald-bg text-white",
    platinum: "bg-tier-platinum-bg text-white",
    gold: "bg-tier-gold-bg text-white",
    silver: "bg-tier-silver-bg text-white",
    bronze: "bg-tier-bronze-bg text-white",
    iron: "bg-tier-iron-bg text-white",
  };

  const style = tierStyles[tier] || tierStyles.gold;
  const displayName = tier.charAt(0).toUpperCase() + tier.slice(1);

  // Division 추가
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
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight shadow-sm ${style}`}
    >
      {displayName}{divisionText}
    </span>
  );
}
