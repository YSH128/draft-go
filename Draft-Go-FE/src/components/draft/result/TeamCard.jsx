import React from "react";
import Badge from "../../ui/Badge";
import { getTierColorKey, getTierLabel } from "../../../constants/riot";

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

const TEAM_COLOR_MAP = {
  Red: "text-[var(--color-team-red)]",
  Blue: "text-[var(--color-team-blue)]",
  Green: "text-[var(--color-team-green)]",
  Purple: "text-[var(--color-team-purple)]",
};

export default function TeamCard({ team }) {
  const borderClass = team.isMyTeam
    ? "border-primary shadow-[0_0_10px_rgba(200,155,60,0.2)]"
    : "border-card-border";

  const sortedPlayers = [...team.players].sort((a, b) => {
    const priorityA = ROLE_PRIORITY[a.role.toUpperCase()] || 99;
    const priorityB = ROLE_PRIORITY[b.role.toUpperCase()] || 99;
    return priorityA - priorityB;
  });

  const teamColorClass = TEAM_COLOR_MAP[team.teamColor] || "text-gray-400";

  return (
    <div
      className={`bg-card-dark relative flex flex-col rounded-xl border p-5 ${borderClass}`}
    >
      {/* 1. 헤더 수정 */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-full flex-col justify-center pt-1">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={`text-xl font-bold ${team.isMyTeam ? "text-primary" : "text-white"}`}
            >
              {team.leaderName} 팀
            </h3>
            {team.isMyTeam && (
              <Badge variant="bid" className="text-[10px]">
                내 팀
              </Badge>
            )}
          </div>
          <span
            className={`text-sm font-bold tracking-wider uppercase ${teamColorClass}`}
          >
            {team.teamColor} Team
          </span>
        </div>

        <div className="border-card-border bg-card-bg/50 flex min-w-[90px] flex-col items-center justify-center rounded-lg border p-2">
          <span className="mb-1 text-[10px] tracking-wider text-gray-500 uppercase">
            평균 티어
          </span>
          <Badge variant={getTierColorKey(team.averageTier)} className="px-1.5">
            {getTierLabel(team.averageTier)}
          </Badge>
        </div>
      </div>

      {/* 2. 선수 목록 */}
      <div className="flex-1 space-y-2">
        {sortedPlayers.map((player, index) => {
          const tierVariant = getTierColorKey(player.tier);
          const tierName = getTierLabel(player.tier);
          const roleIconSrc = ROLE_ICONS[player.role.toUpperCase()] || topIcon;
          const playerRowClass = player.isMe
            ? "border-primary bg-primary/10 shadow-[inset_0_0_10px_rgba(200,155,60,0.1)]"
            : "border-card-border/50 bg-card-bg";

          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded border p-2 ${playerRowClass}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex w-8 justify-center">
                  <img
                    src={roleIconSrc}
                    alt={player.role}
                    className="h-6 w-6 object-contain opacity-80"
                  />
                </div>
                <Badge
                  variant={tierVariant}
                  className="w-[70px] justify-center px-0 whitespace-nowrap"
                >
                  {tierName}
                </Badge>
              </div>
              <span
                className={`ml-3 flex-1 truncate text-sm font-medium ${player.isMe ? "text-primary font-bold" : "text-white"}`}
              >
                {player.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
