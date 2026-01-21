import { Icon } from "../../../components/ui";

/**
 * 포지션 슬롯 컴포넌트
 * - 빈 슬롯 또는 배정된 선수 표시
 *
 * @param {Object} position - 포지션 정보 { key, label, icon }
 * @param {Object} player - 선수 정보 (있으면 표시) { name, imageUrl }
 */
export default function PositionSlot({ position, player = null }) {
  const hasPlayer = !!player;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* 슬롯 이미지 */}
      <div
        className={`relative flex size-14 items-center justify-center rounded border bg-black/40 bg-cover bg-center ${
          hasPlayer
            ? "border-primary/40"
            : "border-primary/10"
        }`}
        style={hasPlayer && player.imageUrl ? { backgroundImage: `url('${player.imageUrl}')` } : undefined}
      />

      {/* 포지션 / 이름 라벨 */}
      <div className="flex w-14 items-center justify-center gap-1">
        <Icon
          name={position.icon}
          className={`text-[10px] font-medium ${hasPlayer ? "text-primary" : "text-primary/50"}`}
        />
        <span
          className={`truncate text-[10px] font-medium ${
            hasPlayer ? "text-white" : "text-primary/50"
          }`}
        >
          {hasPlayer ? player.name : position.label}
        </span>
      </div>
    </div>
  );
}
