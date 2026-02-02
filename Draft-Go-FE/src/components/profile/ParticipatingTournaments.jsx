import { useNavigate } from "react-router-dom";
import {
  UI_DRAFT_STATUS,
  STATUS_API_TO_UI,
  STATUS_ROUTES,
  STATUS_LABELS,
} from "../../constants/draft";

// 상태별 스타일 설정 (UI 상태값 기준)
const STATUS_STYLES = {
  [UI_DRAFT_STATUS.RECRUITING]: {
    borderColor: "border-yellow-500",
    bgColor: "bg-[#3d3a1e]",
    textClass: "text-yellow-400",
    actionLabel: "대기방 입장",
    actionColor: "text-yellow-500",
  },
  [UI_DRAFT_STATUS.IN_PROGRESS]: {
    borderColor: "border-green-500",
    bgColor: "bg-[#1e3a2f]",
    textClass: "text-green-400",
    actionLabel: "경매장 입장",
    actionColor: "text-green-400",
  },
  [UI_DRAFT_STATUS.SCHEDULED]: {
    borderColor: "border-blue-500",
    bgColor: "bg-[#1e2a3f]",
    textClass: "text-blue-400",
    actionLabel: "대기방 입장",
    actionColor: "text-blue-400",
  },
  [UI_DRAFT_STATUS.COMPLETED]: {
    borderColor: "border-gray-500",
    bgColor: "bg-[#374151]",
    textClass: "text-gray-400",
    actionLabel: "결과 보기",
    actionColor: "text-gray-400",
  },
};

// 기본 스타일 (폴백용)
const DEFAULT_STYLE = STATUS_STYLES[UI_DRAFT_STATUS.COMPLETED];

/**
 * API 상태값 또는 UI 상태값을 UI 상태값으로 정규화
 * @param {string} status - API 또는 UI 상태값
 * @returns {string} UI 상태값
 */
const normalizeStatus = (status) => {
  if (!status) return UI_DRAFT_STATUS.COMPLETED;
  // 이미 UI 상태값이면 그대로 반환
  if (Object.values(UI_DRAFT_STATUS).includes(status)) {
    return status;
  }
  // API 상태값이면 UI 상태값으로 변환
  return STATUS_API_TO_UI[status] || UI_DRAFT_STATUS.COMPLETED;
};

export default function ParticipatingTournaments({ tournaments = [] }) {
  const navigate = useNavigate();

  const handleAction = (draftId, status) => {
    const uiStatus = normalizeStatus(status);
    const getRoute = STATUS_ROUTES[uiStatus];

    if (getRoute) {
      navigate(getRoute(draftId));
    }
  };

  const getActionText = (status) => {
    const uiStatus = normalizeStatus(status);
    const style = STATUS_STYLES[uiStatus] || DEFAULT_STYLE;

    return (
      <div className={`text-sm font-bold ${style.actionColor}`}>
        {style.actionLabel}
      </div>
    );
  };


  return (
    <div className="flex flex-col gap-2 h-full">
      {tournaments.length > 0 ? (
        tournaments.map((tournament) => {
          const uiStatus = normalizeStatus(tournament.status);
          const statusStyle = STATUS_STYLES[uiStatus] || DEFAULT_STYLE;
          const statusLabel = STATUS_LABELS[uiStatus] || "완료";

          // draftAdapter 데이터 또는 기존 tournament 데이터 호환
          const name = tournament.title || tournament.name || "대회";
          const displayName = name.length > 12 ? name.slice(0, 12) + "..." : name;
          const date = tournament.createdAtRelative || tournament.date || "";
          const ownerName = tournament.ownerName || tournament.myTeam?.leaderName || "방장";
          const draftId = tournament.id || tournament.draftId;

          return (
            <div
              key={draftId}
              className={`flex items-center rounded-md border-l-4 h-20 transition-all hover:brightness-110 cursor-pointer ${statusStyle.borderColor} ${statusStyle.bgColor}`}
              onClick={() => handleAction(draftId, tournament.status)}
            >
              {/* 1. 대회 정보 (좌측) */}
              <div className="w-[110px] shrink-0 flex flex-col items-center justify-center px-3 border-r border-white/5">
                <div className={`text-sm font-bold ${statusStyle.textClass}`}>
                  {statusLabel}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{date}</div>
              </div>

              {/* 2. 대회명 & 방장 */}
              <div className="flex items-center gap-3 px-4 flex-1 min-w-0">
                {/* 썸네일 또는 아이콘 */}
                <div className="relative shrink-0">
                  {tournament.thumbnailUrl ? (
                    <div className="h-12 w-12 rounded-lg overflow-hidden ring-2 ring-black/50">
                      <img
                        src={tournament.thumbnailUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-700 flex items-center justify-center ring-2 ring-black/50">
                      <span className="text-lg font-bold text-gray-300">
                        {ownerName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 대회명 & 방장 */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="text-sm font-bold text-gray-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    방장: {ownerName}
                  </div>
                </div>
              </div>

              {/* 3. 액션 버튼 (우측) */}
              <div className="shrink-0 flex flex-col items-center justify-center px-4 border-l border-white/5">
                {getActionText(tournament.status)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/30">
          <p className="text-sm text-gray-500">참가한 대회가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
