import { useNavigate } from "react-router-dom";


// 대회 상태에 따른 스타일 설정 (draftAdapter 상태값 호환)
const STATUS_CONFIG = {
  // 기존 형식 호환
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
  // draftAdapter 상태값 호환
  "recruiting": {
    label: "모집중",
    borderColor: "border-yellow-500",
    bgColor: "bg-[#3d3a1e]",
    textClass: "text-yellow-400",
  },
  "in-progress": {
    label: "진행중",
    borderColor: "border-green-500",
    bgColor: "bg-[#1e3a2f]",
    textClass: "text-green-400",
  },
  "completed": {
    label: "종료",
    borderColor: "border-gray-500",
    bgColor: "bg-[#374151]",
    textClass: "text-gray-400",
  },
};

export default function ParticipatingTournaments({ tournaments = [] }) {
  const navigate = useNavigate();

  const handleAction = (draftId, status) => {
    // 상태에 따른 이동 로직
    if (status === 'recruiting' || status === 'RECRUITING' || status === 'LOBBY') {
      navigate(`/draft/room/${draftId}`);
    } else if (status === 'in-progress' || status === 'IN_DRAFT' || status === 'AUCTION' || status === 'ONGOING') {
      navigate(`/draft/room/${draftId}`);
    } else if (status === 'completed' || status === 'COMPLETED' || status === 'FINISHED') {
       // 결과 페이지가 있다면 이동, 없으면 알림 등 (현재는 결과 페이지 가정)
       // TODO: 결과 페이지 라우트 확인 필요, 우선은 draft room으로 보내거나 알림
       // navigate(`/draft/result/${draftId}`);
       alert("종료된 대회입니다."); // 임시 처리
    }
  };

  const getActionText = (draftId, status) => {
     let label = "입장하기";
     let colorClass = "text-blue-400"; // default

     const s = String(status).toLowerCase();
     
     if (s === 'recruiting' || s === 'lobby') {
        label = "대기방 입장";
        colorClass = "text-yellow-500"; 
     } else if (s === 'in-progress' || s === 'in_draft' || s === 'auction' || s === 'ongoing') {
        label = "경매장 입장";
        colorClass = "text-green-400";
     } else if (s === 'completed' || s === 'finished') {
        label = "결과 보기";
        colorClass = "text-gray-400";
     }

     return (
        <div className={`text-sm font-bold ${colorClass}`}>
          {label}
        </div>
     );
  };


  return (
    <div className="flex flex-col gap-2 h-full">
      {tournaments.length > 0 ? (
        tournaments.map((tournament) => {
          const statusStyle = STATUS_CONFIG[tournament.status] || STATUS_CONFIG.completed;

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
                  {statusStyle.label}
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

              {/* 3. 액션 버튼 (우측) - 기존 참가자 수 대체 */}
              <div className="shrink-0 flex flex-col items-center justify-center px-4 border-l border-white/5">
                 {getActionText(draftId, tournament.status)}
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
