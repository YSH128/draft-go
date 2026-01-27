import { POSITIONS } from "../../../constants/riot";

/**
 * 유찰 대기열 플레이어 카드
 * - 흐릿한 스타일 + grayscale 적용
 *
 * @param {Object} player - 플레이어 정보
 */
export default function PassedQueueCard({ player }) {
  const { name, imageUrl, tier, position } = player;
  const tierLower = tier?.toLowerCase() || "gold";

  const positionIcon =
    POSITIONS.find((pos) => pos.id === String(position || "").toUpperCase())?.icon || null;

  return (
    <div className="group flex items-center gap-3 rounded border border-white/5 bg-card-dark/40 p-2.5 opacity-60 transition-opacity hover:opacity-100">
      {/* 프로필 이미지 */}
      <div
        className="size-9 rounded bg-cover bg-center grayscale group-hover:grayscale-0"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* 정보 */}
      <div className="flex min-w-0 flex-col justify-center gap-1">
        {/* 포지션 + 이름 */}
        <div className="flex items-center gap-1">
          {positionIcon && (
            <img
              src={positionIcon}
              alt={position}
              className="h-3 w-3 opacity-80"
            />
          )}
          <p className="truncate text-[11px] font-bold text-white/70 group-hover:text-white">
            {name}
          </p>
        </div>

        {/* 티어 배지 */}
        <div className="flex">
          <SmallTierTag tier={tierLower} />
        </div>
      </div>
    </div>
  );
}

/**
 * 작은 티어 태그
 */
function SmallTierTag({ tier }) {
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

  return (
    <span
      className={`inline-block rounded-sm px-1 py-0 text-[8px] font-bold uppercase leading-tight ${style}`}
    >
      {displayName}
    </span>
  );
}
