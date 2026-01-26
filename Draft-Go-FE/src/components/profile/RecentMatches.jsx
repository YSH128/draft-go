// 게임 시간을 "분:초" 형식으로 변환
const formatDuration = (seconds) => {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}분 ${secs.toString().padStart(2, "0")}초`;
};

// 타임스탬프를 상대 시간으로 변환
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "-";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return "방금 전";
};

// 챔피언 아이콘 URL 생성
const getChampionIconUrl = (championName) => {
  if (!championName) return "";
  return `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${championName}.png`;
};

export default function RecentMatches({ matches = [] }) {
  return (
    <div className="flex flex-col gap-2">
      {matches.length > 0 ? (
        matches.map((match) => <MatchCard key={match.matchId || match.id} match={match} />)
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/30">
          <p className="text-sm text-gray-500">최근 전적 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }) {
  // API 응답 또는 기존 Mock 데이터 호환
  const isWin = match.win ?? match.result === "WIN";
  const championName = match.championName;
  const championIconUrl = match.championIconUrl || getChampionIconUrl(championName);

  // KDA 계산
  const kills = match.kills ?? 0;
  const deaths = match.deaths ?? 0;
  const assists = match.assists ?? 0;
  const kdaRatio = match.kda?.toFixed(2) || match.kdaRatio || "-";

  // 게임 정보
  const gameType = match.gameMode || match.gameType || "-";
  const gameDate = match.gameCreation
    ? formatRelativeTime(match.gameCreation)
    : match.gameDate || "-";
  const gameDuration = match.gameDuration
    ? formatDuration(match.gameDuration)
    : match.gameDuration || "-";

  // 스펠/룬/아이템 존재 여부 (API에 없으면 숨김)
  const hasSpells = match.spells && match.spells.length > 0;
  const hasRunes = match.runes && match.runes.length > 0;
  const hasItems = match.items && match.items.some((item) => item);
  const hasDetailedStats = match.laneScore || match.killParticipation || match.cs;

  return (
    <div
      className={`flex items-center rounded-md border-l-4 h-24 transition-all hover:brightness-110 ${
        isWin ? "border-blue-500 bg-[#28344e]" : "border-red-500 bg-[#59343b]"
      }`}
    >
      {/* 1. 게임 정보 (좌측) */}
      <div className="w-[100px] shrink-0 flex flex-col items-center justify-center px-2 border-r border-white/5">
        <div className="text-[11px] font-medium text-gray-300 whitespace-nowrap mb-1 truncate max-w-[90px]">
          {gameType}
        </div>
        <div className="text-[10px] text-gray-500 mb-1">{gameDate}</div>
        <div className="w-6 h-[1px] bg-gray-600/50 my-1" />
        <div className={`text-sm font-bold ${isWin ? "text-blue-400" : "text-red-400"}`}>
          {isWin ? "승리" : "패배"}
        </div>
        <div className="text-[10px] text-gray-500">{gameDuration}</div>
      </div>

      {/* 2. 챔피언 + 스펠/룬 + 아이템 + KDA */}
      <div className="flex items-center gap-3 px-3 flex-1">
        {/* 챔피언 아이콘 */}
        <div className="relative shrink-0">
          <img
            src={championIconUrl}
            alt={championName}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-black/50"
            onError={(e) => {
              e.target.src = "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/1.png";
            }}
          />
          {match.championLevel && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gray-900 px-1 ring-1 ring-gray-600">
              <span className="text-[9px] font-medium text-white">{match.championLevel}</span>
            </div>
          )}
        </div>

        {/* 스펠 + 룬 (2x2 그리드) - 데이터가 있을 때만 표시 */}
        {(hasSpells || hasRunes) && (
          <div className="grid grid-cols-2 gap-0.5 shrink-0">
            {hasSpells &&
              match.spells.map((spell, idx) => (
                <div key={`spell-${idx}`} className="h-6 w-6 rounded overflow-hidden">
                  <img src={spell} alt="spell" className="h-full w-full object-cover" />
                </div>
              ))}
            {hasRunes &&
              match.runes.map((rune, idx) => (
                <div
                  key={`rune-${idx}`}
                  className={`h-6 w-6 rounded-full overflow-hidden ${idx === 0 ? "bg-black" : "bg-gray-700"}`}
                >
                  <img src={rune} alt="rune" className="h-full w-full object-cover p-0.5" />
                </div>
              ))}
          </div>
        )}

        {/* 아이템 - 데이터가 있을 때만 표시 */}
        {hasItems && (
          <div className="flex gap-0.5 shrink-0">
            {Array.from({ length: 6 }).map((_, idx) => {
              const itemUrl = match.items?.[idx];
              return (
                <div key={idx} className="h-6 w-6 rounded bg-gray-900/80 overflow-hidden">
                  {itemUrl && <img src={itemUrl} alt="item" className="h-full w-full object-cover" />}
                </div>
              );
            })}
            <div className="h-6 w-6 rounded-full bg-gray-900/80 overflow-hidden">
              {match.items?.[6] && (
                <img src={match.items[6]} alt="trinket" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        )}

        {/* KDA */}
        <div className="flex flex-col justify-center ml-2">
          <div className="text-base font-bold text-gray-100 tracking-wide whitespace-nowrap">
            <span className="text-white">{kills}</span>
            <span className="text-gray-500 mx-0.5">/</span>
            <span className="text-red-400">{deaths}</span>
            <span className="text-gray-500 mx-0.5">/</span>
            <span className="text-white">{assists}</span>
          </div>
          <div className="text-[11px] text-gray-400">{kdaRatio}:1 평점</div>
        </div>
      </div>

      {/* 3. 게임 스탯 - 데이터가 있을 때만 표시 */}
      {hasDetailedStats && (
        <div className="w-[115px] shrink-0 flex flex-col justify-center px-3 text-[11px] text-gray-400 border-l border-white/5">
          {match.laneScore && (
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-gray-500 w-9">라인전</span>
              <span className="text-red-400">{match.laneScore.split(":")[0].trim()}</span>
              <span className="text-gray-600">:</span>
              <span className="text-blue-400">{match.laneScore.split(":")[1].trim()}</span>
            </div>
          )}
          {match.killParticipation && (
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-gray-500 w-9">킬관여</span>
              <span className="text-red-400">{match.killParticipation}</span>
            </div>
          )}
          {match.cs && (
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-gray-500 w-9">CS</span>
              <span className="text-gray-300">{match.cs}</span>
            </div>
          )}
          {match.averageTier && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-600 text-[10px]">●</span>
              <span className="text-yellow-500 font-medium text-[10px]">{match.averageTier}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
