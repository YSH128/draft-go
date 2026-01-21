import React from "react";
import TeamCard from "../../components/draft/result/TeamCard";
import { DRAFT_RESULT_MOCK_DATA } from "../../constants/mockData";

export default function DraftResultPage() {
  return (
    // 전체 배경 및 패딩 (반응형 패딩: 모바일 p-4, 데스크탑 p-10)
    <div className="bg-background-dark min-h-screen p-4 text-white md:p-10">
      {/* 1. 페이지 헤더 */}
      <div className="mx-auto mb-10 max-w-[1400px]">
        <h1 className="mb-2 text-4xl font-bold text-white">드래프트 결과</h1>
      </div>

      {/* 2. 섹션 타이틀 (최종 팀 명단) */}
      <div className="mx-auto mb-6 flex max-w-[1400px] items-center gap-3">
        {/* 노란색 세로 막대 장식 */}
        <div className="bg-primary h-6 w-1 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-200">최종 팀 명단</h2>
      </div>

      {/* 3. 팀 카드 그리드 (핵심 레이아웃) */}
      <div className="mx-auto max-w-[1400px]">
        {/* 반응형 그리드: 모바일 1열 -> 태블릿 2열 -> 데스크탑 3열 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {DRAFT_RESULT_MOCK_DATA.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>

      {/* 4. 하단 푸터 (범례 및 안내) */}
      <div className="mx-auto mt-16 max-w-[1400px] border-t border-white/5 pt-8">
        <p className="mt-8 text-center text-xs text-gray-700">
          © 2026 LoL Draft Auction Simulator. All rights reserved.
        </p>
      </div>
    </div>
  );
}
