import { Icon, Badge } from "../../../components/ui";

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
  const { name, imageUrl, tier, position } = player;
  const tierLower = tier?.toLowerCase() || "gold";

  // 포지션별 아이콘 매핑
  const positionIcons = {
    top: "swords",
    jungle: "forest",
    mid: "target",
    adc: "counter_2",
    support: "health_and_safety",
  };

  const posIcon = positionIcons[position?.toLowerCase()] || "person";

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
            <Icon name={posIcon} className="text-xs text-primary" />
            <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-primary">
              {name}
            </p>
          </div>

          {/* 티어 배지 */}
          <div className="flex justify-center gap-1">
            <TierTag tier={tierLower} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 티어 태그 (작은 버전)
 */
function TierTag({ tier }) {
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
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight shadow-sm ${style}`}
    >
      {displayName}
    </span>
  );
}
