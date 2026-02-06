import { useNavigate, useSearchParams } from "react-router-dom";
import TeamCard from "../../components/draft/result/TeamCard";
import useDraftResultData from "../../hooks/useDraftResultData";
import UnifiedChat from "../../components/chat/UnifiedChat";
import { ROUTES } from "../../constants/routes";
import { useChatSocket } from "../../hooks/useChatSocket";
import useTeamAnalysis from "../../hooks/useTeamAnalysis";
import AnalysisResultModal from "../../components/draft/result/AnalysisResultModal";

export default function DraftResultPage() {
  const navigate = useNavigate();
  const { teams, isLoading, isError, isValidId } = useDraftResultData();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get("draftId");
  const draftId = draftIdParam ? Number(draftIdParam) : null;

  // 1. 내 팀 찾기 & 관전자 여부 확인
  const myTeam = teams.find((t) => t.isMyTeam);
  const isSpectator = !myTeam;

  const { sendMessage } = useChatSocket(draftId);
  const { analyzeGame, isAnalyzing, analysisResult, analysisMode, error: analysisError, closeAnalysis } = useTeamAnalysis();

  // 분석 버튼 핸들러
  const handleAnalyze = (targetTeam) => {
    analyzeGame(targetTeam, myTeam);
  };
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
    <div className="flex min-h-screen bg-background-dark text-white">
      {/* 메인 콘텐츠 (자연스러운 스크롤) */}
      <div className="flex-1 p-4 md:p-10 lg:mr-[320px]">
        <div className="mx-auto max-w-[1400px]">
          {/* 페이지 헤더 */}
          <div className="mb-10">
            <h1 className="mb-2 text-4xl font-bold text-white">드래프트 결과</h1>
          </div>

          {/* 섹션 타이틀 */}
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary h-6 w-1 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-200">최종 팀 명단</h2>
          </div>

          {/* 팀 카드 그리드 */}
          <div>
            {teams.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                아직 팀 구성 결과가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    onAnalyze={handleAnalyze}
                    isSpectator={isSpectator}
                  />
                ))}
              </div>
            )}
          </div>


          {/* 하단 푸터 */}
          <div className="mt-16 border-t border-white/5 pt-8">
            <p className="mt-8 text-center text-xs text-gray-700">
              © 2026 Draft-Go. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* 채팅 사이드바 (Fixed 고정) */}
      <UnifiedChat 
        className="w-[320px] h-screen fixed right-0 top-0 border-l border-white/10 hidden lg:flex overflow-hidden"
        viewerCount={0}
        onSendMessage={sendMessage}
      />

      {/* 로비로 나가기 버튼 (Fixed) */}
      <div className="fixed bottom-5 left-5 z-50">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="group flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white/60 transition-all duration-200 hover:border-primary/50 hover:bg-black/80 hover:text-white backdrop-blur-sm"
          title="로비로 나가기"
        >
          <span className="material-symbols-outlined text-lg transition-colors group-hover:text-primary">
            logout
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-primary">
            EXIT
          </span>
        </button>
      </div>

      {/* AI 분석 결과 모달 */}
      {(isAnalyzing || analysisResult || analysisError) && (
        <AnalysisResultModal
          isLoading={isAnalyzing}
          result={analysisResult}
          error={analysisError}
          onClose={closeAnalysis}
          analysisMode={analysisMode}
        />
      )}
    </div>
  );
}
