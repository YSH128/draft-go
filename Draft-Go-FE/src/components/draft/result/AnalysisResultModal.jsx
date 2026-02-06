import React from "react";

/**
 * AI 분석 결과를 보여주는 모달
 */
export default function AnalysisResultModal({ result, onClose, isLoading, error, analysisMode }) {
  if (!result && !isLoading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-card-dark w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
            AI 전력 분석
          </h2>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-purple-300 animate-pulse">
                {analysisMode === "matchup" 
                  ? "양 팀의 전력을 분석하고 있습니다..." 
                  : "우리 팀의 전력을 분석하고 있습니다..."}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                선수들의 모스트 챔피언과 최근 전적을 기반으로 승률을 예측합니다.
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <p className="text-lg text-red-400">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
            <div className="space-y-6">
              
              {/* 1. 헤더 및 요약 (Summary Title & Text) */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${analysisMode === 'matchup' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${analysisMode === 'matchup' ? 'text-red-400' : 'text-blue-400'}`}>
                  <span className="material-symbols-outlined">
                    {analysisMode === 'matchup' ? 'swords' : 'shield'} 
                  </span>
                  {result.summary_title}
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {result.summary_text}
                </p>
              </div>

              {/* 2. 핵심 타겟/플레이어 & 승률 (Key Player + Win Rate) */}
              <div className="flex flex-col gap-4">
                {/* Key Card */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30 flex flex-col justify-start text-left relative overflow-hidden group min-h-[160px]">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className="material-symbols-outlined text-8xl text-white">
                       {analysisMode === 'matchup' ? 'target' : 'diamond'}
                     </span>
                   </div>
                   
                   <h4 className="text-indigo-300 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1 z-10">
                     <span className="material-symbols-outlined text-sm">
                       {analysisMode === 'matchup' ? 'my_location' : 'trophy'}
                     </span>
                     {analysisMode === 'matchup' ? 'PRIMARY TARGET' : 'KEY PLAYER'}
                   </h4>
                   
                   <div className="z-10">
                     {(() => {
                        const text = result.key_player_or_target || "";
                        // "이름 (포지션) - 이유" 형식 파싱 시도
                        const separatorIndex = text.indexOf("-");
                        if (separatorIndex !== -1) {
                          const namePart = text.slice(0, separatorIndex).trim();
                          const reasonPart = text.slice(separatorIndex + 1).trim();
                          return (
                            <>
                              <div className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">
                                {namePart}
                              </div>
                              <div className="text-sm text-indigo-100/80 font-medium leading-relaxed break-keep">
                                {reasonPart}
                              </div>
                            </>
                          );
                        }
                        // 파싱 실패 시 통으로 출력하되 스타일 개선
                        return (
                          <div className="text-xl font-bold text-white leading-snug">
                            {text}
                          </div>
                        );
                     })()}
                   </div>
                </div>

                {/* Win Rate (Only if exists) */}
                {result.win_rate_prediction && (
                  <div className="bg-gray-800/80 rounded-xl p-5 border border-white/10 flex flex-col justify-center items-center text-center">
                    <h4 className="text-gray-400 text-sm font-bold mb-2">예상 승률</h4>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                      {result.win_rate_prediction}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. 분석 포인트 (Points List) */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                <h3 className="text-md font-bold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-500">analytics</span>
                  분석 리포트
                </h3>
                <ul className="space-y-3">
                  {result.points?.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <span className="text-gray-500 mt-1 text-xs">●</span>
                      <span className="text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            </div>
          ) : null}
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-black/20 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
