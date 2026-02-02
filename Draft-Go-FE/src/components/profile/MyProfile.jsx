import React, { useState, useEffect } from "react";
import {
  POSITIONS,
  getTierLabel,
  getTierImage,
} from "../../constants/riot";

// 한글 포지션 명칭
const ROLE_NAMES = {
  TOP: "탑",
  JUNGLE: "정글",
  MID: "미드",
  BOT: "원딜",
  SUP: "서폿",
};

// 포지션 ID로 해당 포지션 객체 찾기
const getPosition = (positionId) => {
  return POSITIONS.find((p) => p.id === positionId);
};

// 프로필 아이콘 URL 생성 (기본값)
const getProfileIconUrl = (profileIconId) => {
  return profileIconId
    ? `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${profileIconId}.png`
    : "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/1.png";
};

export default function MyProfile({ data, recentStats, onProfileUpdate, onRefreshMatches }) {
  if (!data) return null;

  // --- 상태 관리 (편집 기능용) ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editData, setEditData] = useState({
    mainPosition: data.mainPosition || "TOP",
    subPosition: data.subPosition || "JUNGLE",
    bio: data.bio || "", // introduction -> bio 변경
  });

  // 데이터 변경 시 상태 동기화
  useEffect(() => {
    setEditData({
      mainPosition: data.mainPosition || "TOP",
      subPosition: data.subPosition || "JUNGLE",
      bio: data.bio || "", // introduction -> bio 변경
    });
  }, [data]);

  const handleSave = async () => {
    if (!onProfileUpdate) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const result = await onProfileUpdate(data.memberId, {
      mainPosition: editData.mainPosition,
      subPosition: editData.subPosition,
      bio: editData.bio, // introduction -> bio 변경
    });
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      alert(result.error || "프로필 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    setEditData({
      mainPosition: data.mainPosition || "TOP",
      subPosition: data.subPosition || "JUNGLE",
      bio: data.bio || "", // introduction -> bio 변경
    });
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    if (!onRefreshMatches) return;

    setIsRefreshing(true);
    const result = await onRefreshMatches(data.memberId, data.username);
    setIsRefreshing(false);

    if (!result.success) {
      alert(result.error || "전적 갱신에 실패했습니다.");
    } else {
      alert("전적 갱신이 완료되었습니다."); // 성공 피드백 추가
    }
  };

  // --- 렌더링 헬퍼 ---
  // 어댑터에서 정규화된 티어 정보 사용 (data.tier, data.division)
  const tier = data.tier || data.stats?.tier || "UNRANKED";
  const division = data.division || data.stats?.division || "";
  const tierImageSrc = getTierImage(tier);
  const tierLabel = getTierLabel(tier);
  const tierDisplay = division ? `${tierLabel} ${division}` : tierLabel;

  // 프로필 아이콘 URL (API에서 profileIconUrl이 있으면 최우선 사용, 없으면 profileIconId로 조합)
  const avatarUrl = data.profileIconUrl || data.avatarUrl || getProfileIconUrl(data.profileIconId);

  // 색상 테마 (골드/프리미엄 느낌)
  const THEME = {
    goldText: "text-[#c8aa6e]",
    goldBorder: "border-[#c8aa6e]",
    darkBg: "bg-[#091120]", // 아주 어두운 네이비
    cardBg: "bg-[#13161f]", // 좌측 카드 배경
    divider: "border-gray-700",
  };

  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-[#1c1f2e] to-[#13151c] p-1 border border-gray-800 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-0 md:gap-8 bg-[#0a0c10] rounded-lg p-6 md:p-10 relative overflow-hidden">
        
        {/* 편집 컨트롤 (우측 상단 고정) */}
        <div className="absolute top-6 right-6 z-20">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-bold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              정보 수정
            </button>
          ) : (
             <div className="flex items-center gap-2">
                <button
                   onClick={handleCancel}
                   disabled={isSaving}
                   className="px-3 py-1 rounded border border-gray-600 text-gray-400 font-bold text-xs hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                   취소
                </button>
                <button
                   onClick={handleSave}
                   disabled={isSaving}
                   className="px-3 py-1 rounded bg-[#c8aa6e] text-[#0a0c10] font-bold text-xs hover:bg-[#b09458] transition-colors shadow-lg disabled:opacity-50"
                >
                   {isSaving ? "저장 중..." : "저장"}
                </button>
             </div>
          )}
        </div>

        {/* ================= 좌측: 프로필 카드 (Identity) ================= */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col relative">
          {/* 카드 프레임 장식 (골드 라인) */}
          <div className={`absolute inset-0 border border-white/5 rounded-xl pointer-events-none`}>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c8aa6e]/50 to-transparent" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c8aa6e]/50 to-transparent" />
          </div>

          <div className={`h-full bg-[#13161f] rounded-xl p-8 flex flex-col items-center text-center border border-white/5 relative z-10`}>
            {/* 프로필 이미지 영역 */}
            <div className="relative mb-6">
               {/* 골드 링 제거 */}
               <div className="w-36 h-36 rounded-full overflow-hidden bg-black shadow-2xl">
                 <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
               </div>
            </div>

            {/* 이름 및 티어 */}
            {/* 이름 및 티어 */}
            {/* 이름 및 티어 */}
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-baseline justify-center gap-1">
              {data.gameName}
              <span className="text-lg text-gray-400 font-medium">#{data.tagLine}</span>
            </h2>
            <div className="flex items-center gap-2 mb-2">
               {/* 티어 아이콘 (작게) */}
               <img src={tierImageSrc} alt={tierDisplay} className="w-4 h-4 object-contain" />
               <span className={`text-sm font-bold ${THEME.goldText} uppercase tracking-wider`}>{tierDisplay}</span>
            </div>
            <span className="text-xs text-gray-500 mb-8">아이디: {data.username}</span>

            {/* 하단 대형 엠블럼 (장식용) */}
            <div className="mt-auto opacity-80 decoration-slice pointer-events-none mb-4">
               <img src={tierImageSrc} alt="Tier Emblem" className="w-32 h-32 object-contain drop-shadow-2xl" />
            </div>

            {/* 전적 갱신 버튼 (최하단) */}
            <button
               className={`flex items-center justify-center gap-2 w-full py-2.5 rounded text-white font-bold text-sm transition-all shadow-lg z-20 ${
                 isRefreshing
                   ? "bg-gray-600 cursor-not-allowed"
                   : "bg-blue-600 hover:bg-blue-500 active:translate-y-0.5"
               }`}
               onClick={handleRefresh}
               disabled={isRefreshing}
            >
               <svg className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               {isRefreshing ? "갱신 중..." : "전적 갱신"}
            </button>
          </div>
        </div>

        {/* ================= 우측: 정보 및 기능 (비주얼/편집 모드) ================= */}
        <div className="flex-1 flex flex-col pt-4 md:pl-4">
           
           {/* 헤더 */}
           <div className="flex items-center gap-2 mb-8 border-b border-gray-800 pb-4">
             <div className="w-1 h-5 bg-[#c8aa6e] rounded-full" />
             <h3 className="text-lg font-bold text-gray-200">포지션 및 챔피언</h3>
           </div>

           {/* ----------------- [1. 포지션 및 챔피언 Row] ----------------- */}
           <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.2fr] gap-8 mb-6 items-center">
              
              {/* 포지션 (Main / Sub) */}
              <div className="flex flex-col gap-6">
                 {/* Main Line */}
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 w-16">주 라인</span>
                    
                    {isEditing ? (
                       // 편집 모드: 포지션 선택
                       <div className="flex gap-2">
                          {POSITIONS.map(pos => (
                             <button
                                key={`main-${pos.id}`}
                                onClick={() => setEditData({...editData, mainPosition: pos.id})}
                                className={`w-12 h-12 p-2.5 rounded border border-gray-700 ${editData.mainPosition === pos.id ? "bg-[#c8aa6e] border-[#c8aa6e]" : "bg-[#1c1f26] hover:bg-gray-700"}`}
                             >
                                <img src={pos.icon} className={`w-full h-full ${editData.mainPosition === pos.id ? "invert brightness-0" : ""}`} />
                             </button>
                          ))}
                       </div>
                    ) : (
                       // 뷰 모드
                       <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-[#1c1f26] border border-[#c8aa6e]/30 rounded-lg flex items-center justify-center shadow-lg hover:border-[#c8aa6e] transition-colors">
                             <img src={getPosition(editData.mainPosition)?.icon} alt="Main" className="w-10 h-10 opacity-90" />
                          </div>
                          <span className="text-2xl font-bold text-white tracking-wide">{ROLE_NAMES[editData.mainPosition]}</span>
                       </div>
                    )}
                 </div>

                 {/* Sub Line */}
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 w-16">서브 라인</span>
                     {isEditing ? (
                       // 편집 모드: 포지션 선택
                       <div className="flex gap-2">
                          {POSITIONS.map(pos => (
                             <button
                                key={`sub-${pos.id}`}
                                onClick={() => setEditData({...editData, subPosition: pos.id})}
                                className={`w-10 h-10 p-2 rounded border border-gray-700 ${editData.subPosition === pos.id ? "bg-[#c8aa6e] border-[#c8aa6e]" : "bg-[#1c1f26] hover:bg-gray-700"}`}
                             >
                                <img src={pos.icon} className={`w-full h-full ${editData.subPosition === pos.id ? "invert brightness-0" : ""}`} />
                             </button>
                          ))}
                       </div>
                    ) : (
                       // 뷰 모드
                       <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-transparent flex items-center justify-center opacity-80">
                             <img src={getPosition(editData.subPosition)?.icon} alt="Sub" className="w-8 h-8" />
                          </div>
                          <span className="text-lg font-bold text-gray-400">{ROLE_NAMES[editData.subPosition]}</span>
                       </div>
                    )}
                 </div>
              </div>

              {/* 세로 구분선 (Large Screen) */}
              <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

              {/* 선호 챔피언 (TOP 3) */}
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-gray-500 mb-4 block">선호 챔피언 (TOP 3)</span>
                 <div className="flex items-start gap-4">
                    {(data.mostChampions && data.mostChampions.length > 0) ? (
                       data.mostChampions.slice(0, 3).map((champ, idx) => (
                          <div key={champ.championId || idx} className="flex flex-col items-center gap-2 group">
                             <div className={`relative w-16 h-16 rounded-full p-[2px] ${idx === 0 ? 'bg-gradient-to-b from-[#c8aa6e] to-[#7a5c29]' : 'bg-gray-700'}`}>
                                <img
                                   src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${champ.championName}.png`}
                                   alt={champ.championName}
                                   className="w-full h-full rounded-full object-cover border-2 border-[#0a0c10]"
                                />
                             </div>
                             <span className="text-xs font-medium text-gray-400 group-hover:text-white">{champ.championName}</span>
                          </div>
                       ))
                    ) : (
                       <span className="text-xs text-gray-500">전적 데이터가 없습니다</span>
                    )}
                 </div>
              </div>
           </div>

           {/* ----------------- [2. 전적 통계 Row] ----------------- */}
           {(recentStats?.totalGames > 0 || data.stats) && (
              <div className="flex flex-col flex-1 min-h-0">
                 <h4 className="text-sm font-bold text-white mb-3 shrink-0">
                    최근 {recentStats?.totalGames || 0}게임 통계
                 </h4>
                 <div className="w-full bg-[#13161f] border border-gray-800 rounded-lg p-5 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                       <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">승률</p>
                          <p className="text-lg font-bold text-[#c8aa6e]">{recentStats?.winRate || 0}%</p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">승리</p>
                          <p className="text-lg font-bold text-blue-400">{recentStats?.wins || 0}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">패배</p>
                          <p className="text-lg font-bold text-red-400">{recentStats?.losses || 0}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">평균 KDA</p>
                          <p className="text-lg font-bold text-green-400">{recentStats?.avgKda || 0}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">LP</p>
                          <p className="text-lg font-bold text-white">{data.stats?.leaguePoints || 0}</p>
                       </div>
                    </div>
                 </div>

                 {/* ----------------- [3. 자기소개(BIO) Row] ----------------- */}
                 <h4 className="text-sm font-bold text-white mb-3 shrink-0">자기소개</h4>
                 <div className="flex-1 w-full bg-[#13161f] border border-gray-800 rounded-lg p-5 min-h-[120px] max-h-[200px] overflow-y-auto relative">
                   {isEditing ? (
                     <textarea
                       className="w-full h-full bg-transparent text-sm text-gray-300 resize-none focus:outline-none placeholder-gray-600"
                       placeholder="자기소개를 입력해주세요 (최대 200자)"
                       value={editData.bio} // bio 필드 사용
                       onChange={(e) => setEditData({...editData, bio: e.target.value})} // bio 필드 업데이트
                       maxLength={200}
                     />
                   ) : (
                     data.bio ? ( // bio 필드 표시
                       <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                         {data.bio}
                       </p>
                     ) : (
                       <p className="text-sm text-gray-500 italic">
                         자기소개가 없습니다.
                       </p>
                     )
                   )}
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
}
