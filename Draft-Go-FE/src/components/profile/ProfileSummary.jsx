import React from "react";
import {
  getTierLabel,
  getTierImage,
  getTierColorKey,
} from "../../constants/riot";

export default function ProfileSummary({ data }) {
  if (!data) return null;

  const tierImageSrc = getTierImage(data.tier);
  const tierColorKey = getTierColorKey(data.tier);
  const tierLabel = getTierLabel(data.tier);

  const handleEditAvatar = () => {
    console.log("Edit avatar clicked");
  };

  return (
    <div className="border-card-border bg-card-dark flex w-full h-full flex-col items-center justify-center rounded-xl border px-5 py-4 md:w-[320px] gap-2">
      {/* 1. 프로필 이미지 & 편집 버튼 */}
      <div className="relative">
        <div className="border-card-border h-28 w-28 overflow-hidden rounded-full border-4 shadow-xl">
          <img
            src={data.avatarUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        {/* 편집 버튼 */}
        <button
          onClick={handleEditAvatar}
          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-gray-500 bg-gray-700 text-gray-200 transition-colors hover:bg-gray-600 hover:text-white"
          aria-label="프로필 사진 변경"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* 2. 닉네임, 태그, 아이디 */}
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">{data.gameName}</h2>
        <span className="text-sm font-medium text-gray-400">#{data.tagLine}</span>
        <span className="text-[10px] text-gray-500">{data.username}</span>
      </div>

      {/* 3. 티어 엠블럼 이미지 */}
      <div className="flex w-full flex-col items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div
            className={`absolute h-14 w-14 rounded-full blur-2xl bg-tier-${tierColorKey}-bg opacity-30`}
          ></div>
          <img
            src={tierImageSrc}
            alt={tierLabel}
            className="relative z-10 h-full w-full object-contain drop-shadow-xl transform scale-110"
          />
        </div>
        <span
          className={`mt-1 text-lg font-bold tracking-widest uppercase text-tier-${tierColorKey}`}
        >
          {tierLabel}
        </span>
      </div>

      {/* 4. 전적 갱신 버튼 */}
      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-500 hover:shadow-md active:scale-95"
        onClick={() => {
          // TODO: 전적 갱신 로직 연결
          console.log("전적 갱신 요청");
        }}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        전적 갱신
      </button>
    </div>
  );
}
