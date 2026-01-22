import React from "react";
import ProfileSummary from "../../components/profile/ProfileSummary";
import GameStyleCard from "../../components/profile/GameStyleCard";
import ParticipatingTournaments from "../../components/profile/ParticipatingTournaments";
import { USER_PROFILE_MOCK_DATA } from "../../constants/mockData";

export default function ProfilePage() {
  return (
    <div className="bg-background-dark min-h-screen p-4 text-white md:p-10">
      {/* 페이지 헤더 */}
      <div className="mx-auto mb-10 max-w-[1400px]">
        <h1 className="mb-2 text-4xl font-bold text-white">내 프로필</h1>
      </div>

      {/* 메인 컨텐츠: 좌측(ProfileSummary) + 우측(GameStyleCard) */}
      <div className="mx-auto max-w-[1400px]">
        {/*
          CSS Grid 사용:
          - 좌측 카드가 자연스러운 높이(auto)를 결정
          - 우측 카드는 grid-rows-subgrid 또는 align-items: stretch로 맞춤
          - 고정 높이 매직 넘버 불필요
        */}
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          {/* 좌측: 프로필 요약 카드 (자연스러운 높이) */}
          <div className="row-span-1">
            <ProfileSummary data={USER_PROFILE_MOCK_DATA} />
          </div>

          {/* 우측: 게임 스타일 카드 (좌측 높이에 맞춤) */}
          <div className="md:max-h-[438px]">
            <GameStyleCard data={USER_PROFILE_MOCK_DATA} />
          </div>
        </div>

        {/* 참가한 대회 목록 */}
        <div className="mt-12">
          <ParticipatingTournaments
            tournaments={USER_PROFILE_MOCK_DATA.participatingTournaments}
          />
        </div>
      </div>

      {/* 하단 푸터 */}
      <div className="mx-auto mt-16 max-w-[1400px] border-t border-white/5 pt-8">
        <p className="mt-8 text-center text-xs text-gray-700">
          © 2026 Draft-Go. All rights reserved.
        </p>
      </div>
    </div>
  );
}
