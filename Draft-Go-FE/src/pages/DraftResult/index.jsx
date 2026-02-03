import { useNavigate } from "react-router-dom";
import TeamCard from "../../components/draft/result/TeamCard";
import useDraftResultData from "../../hooks/useDraftResultData";

export default function DraftResultPage() {
  const navigate = useNavigate();
  const { teams, isLoading, isError, isValidId } = useDraftResultData();

  // draftId가 없는 경우
  if (!isValidId) {
    return (
      <div className="bg-background-dark flex min-h-screen items-center justify-center p-4 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">잘못된 접근입니다</h1>
          <p className="mb-6 text-gray-400">드래프트 ID가 필요합니다.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/80 rounded-lg px-6 py-2 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-background-dark flex min-h-screen items-center justify-center p-4 text-white">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-400">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="bg-background-dark flex min-h-screen items-center justify-center p-4 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-400">오류 발생</h1>
          <p className="mb-6 text-gray-400">
            결과를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/80 rounded-lg px-6 py-2 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 text-white md:p-10">
      {/* 페이지 헤더 */}
      <div className="mx-auto mb-10 max-w-[1400px]">
        <h1 className="mb-2 text-4xl font-bold text-white">드래프트 결과</h1>
      </div>

      {/* 섹션 타이틀 */}
      <div className="mx-auto mb-6 flex max-w-[1400px] items-center gap-3">
        <div className="bg-primary h-6 w-1 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-200">최종 팀 명단</h2>
      </div>

      {/* 팀 카드 그리드 */}
      <div className="mx-auto max-w-[1400px]">
        {teams.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            아직 팀 구성 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      {/* 홈으로 돌아가기 */}
      <div className="mx-auto mt-12 max-w-[1400px] text-center">
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-gray-700 px-8 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600"
        >
          메인으로
        </button>
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
