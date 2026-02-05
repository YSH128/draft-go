import { useState, useEffect, useRef } from "react";
/**
 * 포지션 슬롯 컴포넌트
 * - 빈 슬롯 또는 배정된 선수 표시
 *
 * @param {Object} position - 포지션 정보 { key, label, icon }
 * @param {Object} player - 선수 정보 (있으면 표시) { name, imageUrl }
 */
export default function PositionSlot({ position, player = null }) {
  const hasPlayer = !!player;
  const [isNew, setIsNew] = useState(false);
  // 이전 플레이어 이름을 추적하여 변경 여부 감지
  const prevPlayerNameRef = useRef(player?.name);

  useEffect(() => {
    // 플레이어가 비어있다가 채워지거나, 다른 사람으로 변경되었을 때 강조
    if (player?.name && player.name !== prevPlayerNameRef.current) {
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 2000);
      return () => clearTimeout(timer);
    }
    prevPlayerNameRef.current = player?.name;
  }, [player?.name]);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* 슬롯 이미지 */}
      <div
        className={`relative flex size-10 items-center justify-center rounded border bg-black/40 bg-cover bg-center transition-all duration-500 ${
          hasPlayer
            ? "border-primary/40"
            : "border-primary/10"
        } ${isNew ? "ring-2 ring-primary shadow-[0_0_15px_rgba(200,155,60,0.8)] scale-110 z-10" : ""}`}
        style={hasPlayer && player.imageUrl ? { backgroundImage: `url('${player.imageUrl}')` } : undefined}
      />

      {/* 포지션 / 이름 라벨 */}
      <div className="flex w-10 items-center justify-center gap-0.5">
        <img
          src={position.icon}
          alt={position.label}
          className={`h-2.5 w-2.5 ${hasPlayer ? "opacity-100" : "opacity-60"}`}
        />
        <span
          className={`truncate text-[9px] font-medium ${
            hasPlayer ? "text-white" : "text-primary/50"
          }`}
        >
          {hasPlayer ? player.name : position.label}
        </span>
      </div>
    </div>
  );
}
