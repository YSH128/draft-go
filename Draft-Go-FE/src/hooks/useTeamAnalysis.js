import { useState } from "react";
import { getMemberProfile, getMatchHistory } from "../api/profileApi";
import { DraftAnalysisService } from "../services/draftAnalysisService";

/**
 * 팀 분석을 위한 데이터 오케스트레이션 및 AI 요청 Hook
 */
export default function useTeamAnalysis() {
  const [analysisMode, setAnalysisMode] = useState("matchup"); // 'single' or 'matchup'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * 개별 선수의 상세 프로필(모스트 챔프, 전적)을 가져옵니다.
   */
  const fetchPlayerDetails = async (player) => {
    // 1. 기본 정보 (데이터 타입 안전하게 변환)
    const profile = {
      memberId: player.memberId ? String(player.memberId) : null,
      name: player.name || "Unknown",
      tier: player.tierRank || "UNRANKED",
      position: player.role || "FILL",
      bidPrice: Number(player.bidPrice) || 0,
      isLeader: Boolean(player.isLeader),
      current_pick: player.championName || null, // 챔피언 선택 정보 (없으면 null)
      mostChampions: [],
      matchHistory: [],
    };

    // memberId가 없으면(더미/익명) 기본값 반환
    if (!profile.memberId) return profile;

    try {
      // 2. 상세 프로필 & 전적 병렬 요청
      const [memberData, historyData] = await Promise.all([
        getMemberProfile(profile.memberId).catch(() => null),
        getMatchHistory(profile.memberId, 0, 10).catch(() => []), 
      ]);

      // 3. 모스트 챔피언 추출
      if (memberData && memberData.mostChampions) {
        // API가 객체 배열을 반환하므로 문자열 리스트로 변환 필요
        profile.mostChampions = memberData.mostChampions.map(c => c.championName || c);
      }

      // 4. 매치 기록 미니멀화
      // historyData.content가 배열이거나 historyData 자체가 배열일 수 있음
      const rawMatches = Array.isArray(historyData) 
        ? historyData 
        : (historyData?.content || []);
      
      if (Array.isArray(rawMatches)) {
        profile.matchHistory = rawMatches.map((m) => {
          // 해당 플레이어의 데이터(participant) 찾기
          let myData = null;

          // 1. participants 배열이 있는 경우 (상세 정보 포함)
          if (m.participants && Array.isArray(m.participants)) {
            const normalize = (str) => (str ? str.replace(/\s+/g, "").toLowerCase() : "");
            
            // 1-1. PUUID로 비교 (memberData에 puuid가 있다면 가장 정확)
            if (memberData?.puuid) {
              myData = m.participants.find((p) => p.puuid === memberData.puuid);
            }

            // 1-2. 이름+태그 비교 (PUUID 비교 실패 시)
            if (!myData) {
              const targetName = normalize(profile.name); // draft에서 넘어온 이름 (보통 gameName)
              // API에서 gameName과 tagLine이 분리되어 오는지, 붙어서 오는지 확인 필요
              // 여기서는 API 응답의 riotIdGameName, riotIdTagLine 등을 활용
              
              myData = m.participants.find(p => {
                const pName = normalize(p.riotIdGameName || p.summonerName);
                if (pName === targetName) return true;
                return false;
              });
            }
            
            // 1-3. 못 찾았으면 첫 번째 데이터 사용 (Fallback - 위험하지만 0승보단 나음)
            if (!myData && m.participants.length > 0) {
              // 1명분만 오는 API일 수도 있음
               myData = m.participants[0];
            }
          } 
          // 2. participants가 없고 최상위에 데이터가 있는 경우 (단일 사용자 전적 API 패턴)
          else {
             myData = m;
          }

          return {
            championName: myData?.championName || "Unknown",
            win: myData?.win ?? (myData?.result === "WIN"),
            kda: myData?.kda ? String(myData.kda) : "0/0/0",
          };
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch details for ${player.name}`, err);
    }

    return profile;
  };

  /**
   * 팀 데이터를 받아 AI 분석을 실행합니다.
   * @param {Object} targetTeam - 분석할 대상 팀 (상대팀 또는 내 팀)
   * @param {Object|null} myTeam - 내 팀 (상단 비교 시 필요, 없으면 단일 분석)
   */
  const analyzeGame = async (targetTeam, myTeam = null) => {
    if (!targetTeam) {
      setError("분석할 팀 데이터가 없습니다.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 모드 설정 (내 팀이고 상대팀이 없을 때 -> 단일 분석)
      // targetTeam이 내 팀이고, myTeam인자도 내 팀(자신)으로 넘어옴. 
      // 하지만 orchestrator에서 'handleAnalyze'를 보면 targetTeam이 내팀이면 myTeam변수도 내팀임.
      // 상대팀이 존재하는지 여부는 여기서 판단하기 어려우므로, 
      // targetTeam.id === myTeam.id 이면 단일 분석 모드로 간주
      const isSingleAnalysis = myTeam && targetTeam.id === myTeam.id;
      setAnalysisMode(isSingleAnalysis ? "single" : "matchup");

      // 1. 내 팀 데이터 수집 (있으면)
      let myTeamDetails = [];
      if (myTeam) {
        myTeamDetails = await Promise.all(
          myTeam.players.map(fetchPlayerDetails)
        );
      } else {
        // myTeam이 없으면 targetTeam을 myTeam으로 간주 (단일 팀 분석)
        myTeamDetails = await Promise.all(
          targetTeam.players.map(fetchPlayerDetails)
        );
      }

      // 2. 상대 팀 데이터 수집 
      // (myTeam이 존재하고, targetTeam이 myTeam과 다를 때만 상대팀으로 설정)
      let enemyTeamDetails = [];
      if (myTeam && targetTeam.id !== myTeam.id) {
        enemyTeamDetails = await Promise.all(
          targetTeam.players.map(fetchPlayerDetails)
        );
      }

      // 3. AI 서버로 전송할 페이로드 구성
      const payload = {
        myTeam: myTeamDetails,
        enemyTeam: enemyTeamDetails, 
        focus_side: isSingleAnalysis ? "MY_TEAM" : "ENEMY_TEAM", // 분석 대상(클릭한 팀) 식별
      };

      // 4. 분석 요청
      const result = await DraftAnalysisService.analyzeTeamRoster(payload);
      setAnalysisResult(result);
    } catch (err) {
      console.error("AI Analysis Failed:", err);
      // 422 에러 등 상세 메시지 확인
      const msg = err.response?.data?.detail 
        ? `서버 요청 오류: ${JSON.stringify(err.response.data.detail)}`
        : "AI 분석 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeGame,
    isAnalyzing,
    analysisMode, // UI에서 로딩 텍스트 분기용
    analysisResult,
    error,
    closeAnalysis: () => {
      setAnalysisResult(null);
      setError(null);
      setIsAnalyzing(false);
    },
  };
}
