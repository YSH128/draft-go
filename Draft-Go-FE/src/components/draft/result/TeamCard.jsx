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

export default function TeamCard({ team }) {
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
          {team.isMyTeam && (
            <span className="rounded bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black">
              MY TEAM
            </span>
          )}
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
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${playerRowClass}`}
            >
              {/* 포지션 아이콘 */}
              <div className="flex w-auto shrink-0 justify-center border-r border-white/10 pr-3 mr-3">
                <img
                  src={roleIconSrc}
                  alt={player.role}
                  className="h-6 w-6 object-contain opacity-70"
                />
              </div>

              {/* 프로필 아이콘 */}
              <div className="relative shrink-0">
                {player.profileIconUrl ? (
                  <img
                    src={player.profileIconUrl}
                    alt=""
                    className={`h-8 w-8 rounded-full object-cover ${
                      player.isMe
                        ? "ring-offset-card-dark ring-2 ring-yellow-400 ring-offset-1"
                        : "border border-gray-600"
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-medium ${
                      player.isMe ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    {player.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              {/* 티어 이미지 (작게) */}
              <div className="relative h-6 w-6 shrink-0">
                <img
                  src={tierImage}
                  alt={tierLabel}
                  className="h-full w-full object-contain drop-shadow-md"
                  title={tierLabel}
                />
              </div>

              {/* 이름 + 배지들 */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span
                  className={`truncate text-sm ${
                    player.isMe
                      ? "font-bold text-yellow-400"
                      : "font-medium text-white"
                  }`}
                >
                  {player.name}
                </span>
                {/* LEADER 배지 */}
                {player.isLeader && (
                  <span className="shrink-0 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    👑 LEADER
                  </span>
                )}
                {/* KEY 배지 (어댑터에서 계산됨) */}
                {player.isKeyPlayer && (
                  <span className="shrink-0 rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    KEY
                  </span>
                )}
              </div>

              {/* 낙찰가 */}
              {player.bidPrice > 0 && (
                <span
                  className={`shrink-0 text-xs font-medium ${
                    player.isKeyPlayer ? "text-indigo-400" : "text-gray-400"
                  }`}
                >
                  {player.bidPrice}P
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. 포인트 정보 */}
      <div className="border-card-border/30 mt-4 flex justify-between border-t pt-3 text-xs text-gray-500">
        <span>
          사용{" "}
          <span className="font-medium text-gray-300">{team.spentPoint}P</span>
        </span>
        <span>
          잔여{" "}
          <span className="font-medium text-gray-300">{team.finalPoint}P</span>
        </span>
      </div>
    </div>
  );
}
