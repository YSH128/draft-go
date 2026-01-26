import { POSITIONS } from "../../constants/riot";

// 대회 상태에 따른 스타일 설정 (RecentMatches 스타일과 통일)
const STATUS_CONFIG = {
  ONGOING: {
    label: "진행중",
    borderColor: "border-green-500",
    bgColor: "bg-[#1e3a2f]",
    textClass: "text-green-400",
  },
  FINISHED: {
    label: "종료",
    borderColor: "border-gray-500",
    bgColor: "bg-[#374151]",
    textClass: "text-gray-400",
  },
  RECRUITING: {
    label: "모집중",
    borderColor: "border-yellow-500",
    bgColor: "bg-[#3d3a1e]",
    textClass: "text-yellow-400",
  },
};

// 포지션 아이콘 찾기 헬퍼
const getPositionIcon = (role) => {
  return POSITIONS.find(p => p.id === role)?.icon;
};

export default function ParticipatingTournaments({ tournaments = [] }) {
  return (
    <div className="flex flex-col gap-2">
      {tournaments.length > 0 ? (
        tournaments.map((tournament) => {
          const statusStyle = STATUS_CONFIG[tournament.status] || STATUS_CONFIG.FINISHED;

          return (
            <div
              key={tournament.id}
              className={`flex items-center rounded-md border-l-4 h-24 transition-all hover:brightness-110 ${statusStyle.borderColor} ${statusStyle.bgColor}`}
            >
              {/* 1. 대회 상태 (좌측) - RecentMatches의 게임 정보 섹션과 동일 */}
              <div className="w-[100px] shrink-0 flex flex-col items-center justify-center px-2 border-r border-white/5">
                <div className="text-[11px] font-medium text-gray-300 whitespace-nowrap mb-1">
                  {tournament.name.length > 8 ? tournament.name.slice(0, 8) + "..." : tournament.name}
                </div>
                <div className="text-[10px] text-gray-500 mb-1">{tournament.date}</div>
                <div className="w-6 h-[1px] bg-gray-600/50 my-1" />
                <div className={`text-sm font-bold ${statusStyle.textClass}`}>
                  {statusStyle.label}
                </div>
              </div>

              {/* 2. 팀 정보 */}
              <div className="flex items-center gap-3 px-3 flex-1">
                {/* 팀 아이콘 */}
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-black/50">
                    <span className="text-lg font-bold text-gray-300">
                      {tournament.myTeam?.leaderName?.charAt(0) || "T"}
                    </span>
                  </div>
                </div>

                {/* 팀명 */}
                <div className="flex flex-col justify-center">
                  <div className="text-base font-bold text-gray-100 whitespace-nowrap">
                    {tournament.myTeam?.leaderName ? `${tournament.myTeam.leaderName} 팀` : "팀 정보 없음"}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {tournament.myTeam?.players?.length || 0}명 참가
                  </div>
                </div>
              </div>

              {/* 3. 로스터 - 아이콘/폰트 크기 확대 */}
              <div className="shrink-0 flex items-center gap-3 px-4 border-l border-white/5">
                {tournament.myTeam?.players?.map((player, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center ${
                        player.isMe
                          ? "bg-primary/30 ring-2 ring-primary"
                          : "bg-gray-800 border border-gray-600"
                      }`}
                    >
                      <img
                        src={getPositionIcon(player.role)}
                        alt={player.role}
                        className={`h-6 w-6 ${player.isMe ? "opacity-100" : "opacity-70"}`}
                      />
                    </div>
                    <span
                      className={`text-[11px] truncate max-w-[48px] text-center ${
                        player.isMe ? "text-primary font-semibold" : "text-gray-400"
                      }`}
                    >
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/30">
          <p className="text-sm text-gray-500">참가한 대회가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
