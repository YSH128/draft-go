import React from "react";

export default function DraftMemberCard({
  playerName = "Top King",
  role = "TOP",
  tier = "DIAMOND",
  division = null, 
  imageSrc = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jayce.png", // 플레이스홀더 또는 props
}) {
  return (
    <div className="group flex h-20 w-full max-w-sm items-center gap-4 overflow-hidden rounded-xl border border-[#c89b3c]/50 bg-[#091420] px-4 transition-all hover:border-tier-challenger-bg hover:shadow-[0_0_15px_rgba(200,155,60,0.3)]">
      {/* 아바타 (둥근 모서리 사각형) */}
      <div className="relative h-12 w-12 shrink-0">
        <div className="pointer-events-none absolute inset-0 z-10 rounded-lg border border-[#c89b3c]"></div>
        <img
          src={imageSrc}
          alt={playerName}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col pl-2">
        {/* 이름 */}
        <h3 className="text-lg font-black tracking-tight text-white">
          {playerName}
        </h3>

        {/* 보조 정보 (포지션 / 티어) */}
        <p className="mt-0.5 text-xs font-bold text-[#c89b3c]/80">
          {role} <span className="mx-1 opacity-50">/</span> {tier} {division}
        </p>
      </div>
    </div>
  );
}
