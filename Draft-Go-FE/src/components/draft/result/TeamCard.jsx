import {
  getTierColorKey,
  getTierLabel,
  getTierImage,
} from "../../../constants/riot";

import topIcon from "../../../assets/positions/top.svg";
import jungleIcon from "../../../assets/positions/jungle.svg";
import midIcon from "../../../assets/positions/mid.svg";
import botIcon from "../../../assets/positions/bot.png";
import supIcon from "../../../assets/positions/sup.svg";

const ROLE_ICONS = {
  TOP: topIcon,
  JUG: jungleIcon,
  JUNGLE: jungleIcon,
  MID: midIcon,
  ADC: botIcon,
  BOT: botIcon,
  SUP: supIcon,
  SUPPORT: supIcon,
};

const ROLE_PRIORITY = {
  TOP: 1,
  JUG: 2,
  JUNGLE: 2,
  MID: 3,
  ADC: 4,
  BOT: 4,
  SUP: 5,
  SUPPORT: 5,
};

export default function TeamCard({ team, onAnalyze, isSpectator }) {
  // 내 팀 스타일 - 노란색 강조
  const cardClass = team.isMyTeam
    ? "border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
    : "border border-card-border";

  // 포지션 순서대로 정렬
  const sortedPlayers = [...team.players].sort((a, b) => {
    const priorityA = ROLE_PRIORITY[a.role?.toUpperCase()] || 99;
    const priorityB = ROLE_PRIORITY[b.role?.toUpperCase()] || 99;
    return priorityA - priorityB;
  });

  // 평균 티어 정보
  const avgTierImage = getTierImage(team.averageTier);
  const avgTierLabel = getTierLabel(team.averageTier);
  const avgTierColorKey = getTierColorKey(team.averageTier);

  return (
    <div
      className={`bg-card-dark relative flex flex-col rounded-xl p-5 ${cardClass}`}
    >
      {/* 1. 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            className={`text-xl font-bold ${team.isMyTeam ? "text-yellow-400" : "text-white"}`}
          >
            {team.leaderName} 팀
          </h3>
          

        </div>

        {/* 평균 티어 - 이미지 + 텍스트 */}
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10">
            <div
              className={`absolute inset-0 rounded-full blur-md bg-tier-${avgTierColorKey}-bg opacity-40`}
            />
            <img
              src={avgTierImage}
              alt={avgTierLabel}
              className="relative h-full w-full object-contain drop-shadow-lg"
            />
          </div>
          <span className={`text-sm font-bold text-tier-${avgTierColorKey}`}>
            {avgTierLabel}
          </span>
        </div>
      </div>

      {/* 2. 선수 목록 */}
      <div className="flex-1 space-y-1.5">
        {sortedPlayers.map((player, index) => {
          // tierRank 필드 사용 (어댑터에서 변환됨)
          const tierImage = getTierImage(player.tierRank);
          const tierLabel = getTierLabel(player.tierRank);
          const roleIconSrc = ROLE_ICONS[player.role?.toUpperCase()] || topIcon;

          // 내 플레이어 행 강조 (노란색 계열)
          const playerRowClass = player.isMe
            ? "bg-yellow-500/20 border-l-4 border-yellow-400 border-y border-r border-card-border/40"
            : "border border-card-border/40 bg-card-bg/80 hover:bg-card-bg";

          return (
            <div
              key={player.memberId || index}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${playerRowClass}`}
            >
              {/* 1. 포지션 아이콘 (크기 축소 및 패딩 제거) */}
              <div className="flex w-6 shrink-0 justify-center">
                <img
                  src={roleIconSrc}
                  alt={player.role}
                  className="h-5 w-5 object-contain opacity-70"
                />
              </div>

              {/* 2. 프로필 + 티어 (통합) */}
              <div className="relative mr-1 shrink-0">
                {player.profileIconUrl ? (
                  <img
                    src={player.profileIconUrl}
                    alt=""
                    className={`h-8 w-8 rounded-full object-cover ${player.isMe
                      ? "ring-offset-card-dark ring-2 ring-yellow-400 ring-offset-1"
                      : "border border-gray-600"
                      }`}
                  />
                ) : (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-medium ${player.isMe ? "text-yellow-400" : "text-gray-400"
                      }`}
                  >
                    {player.name?.charAt(0) || "?"}
                  </div>
                )}

                {/* 티어 아이콘 (우측 하단 오버레이) */}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-black/50 p-0.5 shadow-sm backdrop-blur-sm">
                  <img
                    src={tierImage}
                    alt={tierLabel}
                    className="h-full w-full object-contain"
                    title={tierLabel}
                  />
                </div>
              </div>

              {/* 3. 이름 + 아이콘 배지 (텍스트 제거) */}
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <span
                  className={`truncate text-sm ${player.isMe
                    ? "font-bold text-yellow-400"
                    : "font-medium text-white"
                    }`}
                  title={player.name}
                >
                  {player.name}
                </span>

                {/* 리더 아이콘 */}
                {player.isLeader && (
                  <span
                    className="material-symbols-outlined shrink-0 text-[16px] text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]"
                    title="팀장 (Leader)"
                  >
                    crown
                  </span>
                )}

                {/* 키 플레이어 아이콘 */}
                {player.isKeyPlayer && (
                  <span
                    className="material-symbols-outlined shrink-0 text-[16px] text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]"
                    title="핵심 선수 (Key Player)"
                  >
                    key
                  </span>
                )}
              </div>

              {/* 4. 낙찰가 (우측 정렬) */}
              {(player.bidPrice !== undefined && player.bidPrice !== null) && (
                <span
                  className={`shrink-0 text-xs font-bold ${player.isKeyPlayer ? "text-indigo-400" : "text-gray-500"
                    }`}
                >
                  {player.bidPrice}P
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. 하단 정보 (포인트 & 분석 버튼) */}
      <div className="border-card-border/30 mt-4 flex items-center justify-between border-t pt-3">
        {/* 좌측: 포인트 정보 (나란히) */}
        <div className="flex gap-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            사용 <span className="text-gray-300">{team.spentPoint}P</span>
          </span>
          <span className="w-px h-3 bg-gray-700"></span>
          <span className="flex items-center gap-1">
            잔여 <span className={`${team.finalPoint < 0 ? 'text-red-400' : 'text-blue-300'}`}>{team.finalPoint}P</span>
          </span>
        </div>

        {/* 우측: AI 분석 버튼 */}
        {!isSpectator && onAnalyze && (
          <button
            onClick={() => onAnalyze(team)}
            className={`
              group relative flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95
              ${team.isMyTeam 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/50" 
                : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50"}
            `}
            title={team.isMyTeam ? "우리 팀 전력 분석" : "상대 팀 공략 분석"}
          >
            <span className={`material-symbols-outlined text-[16px] ${team.isMyTeam ? "animate-pulse" : ""}`}>
              {team.isMyTeam ? "auto_awesome" : "sword_rose"}
            </span>
            <span className="text-xs font-bold tracking-wide">
              {team.isMyTeam ? "AI 분석" : "약점 공략"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
