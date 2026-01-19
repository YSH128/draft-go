import React from "react";
import Avatar from "./Avatar";

export default function TeamLeaderCard({
  captainName = "Hide on bush",
  tier = "challenger",
  mainRole = "MID",
  teamNumber = 1,
}) {
  const tierLower = tier.toLowerCase();
  // CSS 변수 참조
  const tierColor = `var(--color-tier-${tierLower}-bg)`;
  const tierText = `var(--color-tier-${tierLower}-text)`; // 배지 텍스트용 (밝은색일 수도 있음)

  // 메인 텍스트 색상은 배지 배경색(브랜드 컬러)을 따라감 (단, 텍스트가 잘 보이도록 조정 필요할 수 있음)
  // 여기서는 기존 로직대로 '색상'을 텍스트 색으로 사용

  return (
    <div
      className="group relative flex min-h-88 w-64 flex-col items-center overflow-hidden rounded-2xl border bg-card-bg pt-10 pb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
      style={{ borderColor: tierColor }}
    >
      {/* 상단 배너 (티어 배지) */}
      <div className="absolute top-6 left-6 z-10">
        <span
          className="rounded-sm px-2 py-1 text-[10px] font-black tracking-wider uppercase"
          style={{
            backgroundColor: tierColor,
            color: tierText,
          }}
        >
          {tier}
        </span>
      </div>

      {/* 원형 배경 장식 */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border blur-xl"
        style={{
          borderColor: tierColor,
          backgroundColor: tierColor,
          opacity: 0.05,
        }}
      ></div>

      {/* 메인 콘텐츠 영역 (중앙 정렬하되 푸터는 아래로 밀어냄) */}
      <div className="mt-4 flex w-full flex-1 flex-col items-center">
        {/* 아바타 컨테이너 */}
        <div className="relative mb-6">
          <div
            className="animate-pulse-slow absolute inset-0 rounded-full border-2"
            style={{ borderColor: tierColor, opacity: 0.5 }}
          ></div>
          {/* 플레이스홀더 이미지 */}
          <Avatar
            size="xl"
            tier={tier}
            src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Faker.png"
          />
        </div>

        {/* 이름 */}
        <h3 className="mb-1 text-2xl font-black tracking-tight text-white">
          {captainName}
        </h3>
        <p
          className="mb-4 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: tierColor }}
        >
          Team Captain #{teamNumber}
        </p>

        {/* 주 포지션 */}
        <div className="mt-2 flex items-center gap-2">
          {/* 단순 포지션 아이콘 플레이스홀더 */}
          <span
            className="material-symbols-outlined"
            style={{ color: tierColor }}
          >
            grid_view
          </span>
          <span className="text-sm font-bold text-white/60">
            MAIN: {mainRole}
          </span>
        </div>
      </div>

      {/* 하단 장식 바 (챔피언 아이콘) */}
      {/* absolute 위치 대신 flex 레이아웃으로 변경하여 자연스럽게 하단에 배치 */}
      <div className="mt-6 flex gap-2">
        <div
          className="h-10 w-10 rounded-lg border border-white/10 bg-gray-800 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Orianna.png')",
          }}
        ></div>
        <div
          className="h-10 w-10 rounded-lg border border-white/10 bg-gray-800 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Azir.png')",
          }}
        ></div>
        <div
          className="h-10 w-10 rounded-lg border border-white/10 bg-gray-800 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sylas.png')",
          }}
        ></div>
      </div>
    </div>
  );
}
