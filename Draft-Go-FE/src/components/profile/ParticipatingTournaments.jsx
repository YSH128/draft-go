import React from "react";
import { TournamentCardWrapper } from "../ui/TournamentCard";
import Badge from "../ui/Badge";

// 대회 상태에 따른 뱃지 설정
const STATUS_CONFIG = {
  ONGOING: { label: "진행중", variant: "primary" },
  FINISHED: { label: "종료", variant: "secondary" },
  RECRUITING: { label: "모집중", variant: "success" },
};

export default function ParticipatingTournaments({ tournaments = [] }) {
  return (
    <div>
      {/* 섹션 타이틀 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary h-6 w-1 rounded-full"></div>
        <h3 className="text-xl font-bold text-gray-200">참가한 대회</h3>
      </div>

      {/* 대회 목록 */}
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCardWrapper key={tournament.id}>
              {/* 헤더: 그라데이션 배경 + 상태 뱃지 */}
              <div className="relative h-24 bg-gradient-to-br from-gray-800 via-gray-900 to-background-dark p-4">
                <div className="absolute left-4 top-4">
                  <Badge variant={STATUS_CONFIG[tournament.status]?.variant || "secondary"}>
                    {STATUS_CONFIG[tournament.status]?.label || tournament.status}
                  </Badge>
                </div>
                {/* 하단 그라데이션 */}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card-dark to-transparent" />
              </div>

              {/* 본문 */}
              <div className="p-5">
                {/* 대회 이름 */}
                <h4 className="mb-2 truncate text-lg font-bold text-white">
                  {tournament.name}
                </h4>

                {/* 개최 날짜 */}
                <p className="mb-3 text-xs text-gray-500">{tournament.date}</p>

                {/* 소속 팀 정보 */}
                {tournament.myTeam && (
                  <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-2">
                    <span className="text-xs text-gray-500">My Team:</span>
                    <span className="text-sm font-medium text-gray-300">
                      {tournament.myTeam.leaderName} 팀
                    </span>
                  </div>
                )}
              </div>
            </TournamentCardWrapper>
          ))}
        </div>
      ) : (
        /* 데이터 없음 */
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/30">
          <p className="text-sm text-gray-500">참가한 대회가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
