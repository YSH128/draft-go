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
    <div className="border-card-border bg-card-dark flex w-full flex-col items-center rounded-xl border px-6 py-8 md:w-[320px]">
      {/* 1. 프로필 이미지 & 편집 버튼 */}
      <div className="relative mb-4">
        <div className="border-card-border h-28 w-28 overflow-hidden rounded-full border-4">
          <img
            src={data.avatarUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        {/* 편집 버튼 (우측 하단) */}
        <button
          onClick={handleEditAvatar}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600"
          aria-label="프로필 사진 변경"
        >
          <svg
            className="h-4 w-4"
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
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-bold text-white">{data.gameName}</h2>
        <span className="text-sm text-gray-400">#{data.tagLine}</span>
        <span className="text-xs text-gray-500">{data.username}</span>
      </div>

      {/* 3. 티어 엠블럼 이미지 */}
      <div className="flex w-full flex-col items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className={`absolute h-16 w-16 rounded-full blur-2xl bg-tier-${tierColorKey}-bg opacity-20`}
          ></div>
          <img
            src={tierImageSrc}
            alt={tierLabel}
            className="relative z-10 h-full w-full object-contain drop-shadow-lg"
          />
        </div>
        <span
          className={`mt-2 text-base font-bold tracking-wider uppercase text-tier-${tierColorKey}`}
        >
          {tierLabel}
        </span>
      </div>
    </div>
  );
}
