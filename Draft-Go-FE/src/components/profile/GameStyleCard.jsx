import React, { useState } from "react";
import { POSITIONS } from "../../constants/riot";

// 포지션 ID로 해당 포지션 객체 찾기
const getPosition = (positionId) => {
  return POSITIONS.find((p) => p.id === positionId);
};

// 한글 포지션 명칭
const ROLE_NAMES = {
  TOP: "탑",
  JUNGLE: "정글",
  MID: "미드",
  BOT: "원딜",
  SUP: "서폿",
};

export default function GameStyleCard({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [mainPosition, setMainPosition] = useState(data?.mainPosition || "");
  const [subPosition, setSubPosition] = useState(data?.subPosition || "");
  const [introduction, setIntroduction] = useState(data?.introduction || "");

  if (!data) return null;

  const handleSave = () => {
    console.log("Save:", { mainPosition, subPosition, introduction });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMainPosition(data.mainPosition);
    setSubPosition(data.subPosition);
    setIntroduction(data.introduction || "");
    setIsEditing(false);
  };

  return (
    <div className="border-card-border bg-card-dark flex h-[480px] flex-col rounded-xl border p-5">
      {/* 헤더: 제목 + 편집 버튼 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-6 w-1 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-200">포지션 및 플레이 스타일</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
          >
            편집
          </button>
        )}
      </div>

      {!isEditing ? (
        /* ========== 뷰 모드 ========== */
        <>
          {/* 상단: 포지션 + 챔피언 (2분할) */}
          <div className="mb-4 shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 좌측: 주/부 포지션 */}
            <div className="flex flex-col justify-center">
              <div className="flex items-start gap-4">
                {/* 주 라인 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="p-2 bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-inner">
                    <img
                      src={getPosition(mainPosition)?.icon}
                      alt={getPosition(mainPosition)?.label || mainPosition}
                      className="h-16 w-16 opacity-100 drop-shadow-xl"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-white tracking-wide">
                      {ROLE_NAMES[mainPosition] || mainPosition}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Main</span>
                  </div>
                </div>

                {/* 화살표/구분선 */}
                <div className="h-20 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-1 self-center"></div>

                {/* 서브 라인 */}
                <div className="flex flex-col items-center gap-1.5 opacity-80 mt-2">
                  <div className="p-1.5 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <img
                      src={getPosition(subPosition)?.icon}
                      alt={getPosition(subPosition)?.label || subPosition}
                      className="h-12 w-12 opacity-90"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-base font-bold text-gray-300">
                      {ROLE_NAMES[subPosition] || subPosition}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sub</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: MOST 챔피언 (Placeholder) */}
            <div className="flex flex-col justify-center">
              <span className="mb-2 block text-xs font-bold text-gray-400">MOST 챔피언 (TOP 3)</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50 transition-colors hover:border-gray-500 hover:bg-gray-800 group">
                      <span className="text-xl text-gray-600 font-black group-hover:text-gray-500">?</span>
                    </div>
                  </div>
                ))}
              </div>
              <span className="mt-1 text-[10px] text-gray-500 font-medium ml-1">API 연동 예정</span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mb-4 shrink-0 h-px w-full bg-gradient-to-r from-transparent via-gray-700/70 to-transparent"></div>

          {/* 하단: 자기소개 (flex-1로 남은 공간 차지 + 스크롤) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <span className="mb-2 shrink-0 block text-xs font-bold text-gray-400">자기소개</span>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800/30 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200 font-medium">
                {introduction || "아직 자기소개가 없습니다."}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* ========== 편집 모드 ========== */
        /* ========== 편집 모드 (Scaled Down) ========== */
        <>
          {/* 상단: 주/서브 포지션 선택 */}
          <div className="mb-4 shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 주 포지션 선택 */}
            <div className="flex flex-col justify-center">
              <span className="mb-2 block text-xs font-bold text-gray-400">주 포지션 선택</span>
              <div className="flex gap-1.5 flex-wrap">
                {POSITIONS.map((pos) => (
                  <button
                    key={`main-${pos.id}`}
                    onClick={() => setMainPosition(pos.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                      mainPosition === pos.id
                        ? "border-primary bg-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    <img
                      src={pos.icon}
                      alt={pos.label}
                      className={`h-7 w-7 ${mainPosition === pos.id ? "opacity-100 invert-100" : "opacity-60"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 서브 포지션 선택 */}
            <div className="flex flex-col justify-center">
              <span className="mb-2 block text-xs font-bold text-gray-400">서브 포지션 선택</span>
              <div className="flex gap-1.5 flex-wrap">
                {POSITIONS.map((pos) => (
                  <button
                    key={`sub-${pos.id}`}
                    onClick={() => setSubPosition(pos.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                      subPosition === pos.id
                        ? "border-primary bg-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    <img
                      src={pos.icon}
                      alt={pos.label}
                      className={`h-7 w-7 ${subPosition === pos.id ? "opacity-100" : "opacity-60"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mb-4 shrink-0 h-px w-full bg-gradient-to-r from-transparent via-gray-700/70 to-transparent"></div>

          {/* 하단: 자기소개 수정 (flex-1로 남은 공간 차지 + 스크롤) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <span className="mb-2 shrink-0 block text-xs font-bold text-gray-400">자기소개 수정</span>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="자기소개를 입력해주세요..."
              className="flex-1 min-h-0 resize-none rounded-lg border border-gray-600 bg-gray-800/50 p-3 text-sm leading-relaxed text-gray-200 placeholder-gray-500 scrollbar-thin scrollbar-track-gray-800/30 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 저장/취소 버튼 */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-600 px-4 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300 hover:bg-gray-800"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-1.5 text-xs font-bold text-white transition-all shadow-lg hover:shadow-primary/20"
            >
              저장
            </button>
          </div>
        </>
      )}
    </div>
  );
}
