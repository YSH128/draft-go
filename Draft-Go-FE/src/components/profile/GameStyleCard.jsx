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
    <div className="border-card-border bg-card-dark flex h-full flex-col rounded-xl border p-6">
      {/* 헤더: 제목 + 편집 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-6 w-1 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-200">포지션 및 플레이 스타일</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
          >
            편집
          </button>
        )}
      </div>

      {!isEditing ? (
        /* ========== 뷰 모드 ========== */
        <>
          {/* 상단: 포지션 + 챔피언 (2분할) */}
          <div className="mb-6 shrink-0 grid grid-cols-2 gap-6">
            {/* 좌측: 주/부 포지션 */}
            <div>
              <span className="mb-3 block text-xs text-gray-500">주/부 포지션</span>
              <div className="flex items-center gap-6">
                {/* 주 라인 */}
                <div className="flex items-center gap-3">
                  <img
                    src={getPosition(mainPosition)?.icon}
                    alt={getPosition(mainPosition)?.label || mainPosition}
                    className="h-10 w-10 opacity-90"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">주 라인</span>
                    <span className="text-lg font-bold text-white">
                      {ROLE_NAMES[mainPosition] || mainPosition}
                    </span>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="h-10 w-px bg-gray-700"></div>

                {/* 서브 라인 */}
                <div className="flex items-center gap-3">
                  <img
                    src={getPosition(subPosition)?.icon}
                    alt={getPosition(subPosition)?.label || subPosition}
                    className="h-8 w-8 opacity-60"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">서브 라인</span>
                    <span className="text-base font-medium text-gray-400">
                      {ROLE_NAMES[subPosition] || subPosition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: MOST 챔피언 (Placeholder) */}
            <div>
              <span className="mb-3 block text-xs text-gray-500">MOST 챔피언 (TOP 3)</span>
              <div className="flex items-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50">
                      <span className="text-base text-gray-600">?</span>
                    </div>
                  </div>
                ))}
                <span className="text-xs text-gray-600">API 연동 예정</span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mb-6 shrink-0 h-px w-full bg-gray-700/50"></div>

          {/* 하단: 자기소개 (flex-1로 남은 공간 차지 + 스크롤) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <span className="mb-3 shrink-0 block text-xs text-gray-500">자기소개</span>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-200">
                {introduction || "아직 자기소개가 없습니다."}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* ========== 편집 모드 ========== */
        <>
          {/* 상단: 주/서브 포지션 선택 (가로 배치) */}
          <div className="mb-6 shrink-0 grid grid-cols-2 gap-6">
            {/* 주 포지션 선택 */}
            <div>
              <span className="mb-3 block text-xs text-gray-500">주 포지션 선택</span>
              <div className="flex gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={`main-${pos.id}`}
                    onClick={() => setMainPosition(pos.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                      mainPosition === pos.id
                        ? "border-primary bg-primary/20"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={pos.icon}
                      alt={pos.label}
                      className={`h-7 w-7 ${mainPosition === pos.id ? "opacity-100" : "opacity-60"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 서브 포지션 선택 */}
            <div>
              <span className="mb-3 block text-xs text-gray-500">서브 포지션 선택</span>
              <div className="flex gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={`sub-${pos.id}`}
                    onClick={() => setSubPosition(pos.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                      subPosition === pos.id
                        ? "border-primary bg-primary/20"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500"
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
          <div className="mb-6 shrink-0 h-px w-full bg-gray-700/50"></div>

          {/* 하단: 자기소개 수정 (flex-1로 남은 공간 차지 + 스크롤) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <span className="mb-3 shrink-0 block text-xs text-gray-500">자기소개</span>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="자기소개를 입력해주세요..."
              className="flex-1 min-h-0 resize-none rounded-lg border border-gray-600 bg-gray-800 p-4 text-base text-gray-200 placeholder-gray-600 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 focus:border-primary focus:outline-none"
            />
          </div>

          {/* 저장/취소 버튼 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              저장
            </button>
          </div>
        </>
      )}
    </div>
  );
}
