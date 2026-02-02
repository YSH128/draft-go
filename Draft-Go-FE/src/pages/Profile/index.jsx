import { useState, useEffect, useCallback, useMemo } from "react";
import MyProfile from "../../components/profile/MyProfile";
import RecentMatches from "../../components/profile/RecentMatches";
import ParticipatingTournaments from "../../components/profile/ParticipatingTournaments";
import { formatMatchData } from "../../utils/matchAdapter";
import {
  getMyProfile,
  getMatchHistory,
  updateProfile,
  refreshMatches,
  getRefreshStatus,
} from "../../api/profileApi";
import { fetchDrafts } from "../../api/draft";
import { adaptProfile } from "../../api/profileAdapter";

/**
 * 최근 N게임 기준 통계 계산
 * @param {Array} matches - 매치 히스토리 배열
 * @returns {Object} { wins, losses, winRate, avgKda, totalGames }
 */
const calculateRecentStats = (matches) => {
  if (!matches || matches.length === 0) {
    return { wins: 0, losses: 0, winRate: 0, avgKda: 0, totalGames: 0 };
  }

  const wins = matches.filter((m) => m.win).length;
  const losses = matches.length - wins;
  const winRate = Math.round((wins / matches.length) * 100);

  // 평균 KDA 계산
  const totalKills = matches.reduce((sum, m) => sum + (m.kills || 0), 0);
  const totalDeaths = matches.reduce((sum, m) => sum + (m.deaths || 0), 0);
  const totalAssists = matches.reduce((sum, m) => sum + (m.assists || 0), 0);
  const avgKda =
    totalDeaths === 0
      ? (totalKills + totalAssists).toFixed(2)
      : ((totalKills + totalAssists) / totalDeaths).toFixed(2);

  return {
    wins,
    losses,
    winRate,
    avgKda,
    totalGames: matches.length,
  };
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [participatingDrafts, setParticipatingDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 프로필 데이터 로드
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rawData = await getMyProfile();
      const data = adaptProfile(rawData);

      setProfileData(data);

      // 매치 히스토리도 함께 로드
      if (data?.memberId) {
        const matches = await getMatchHistory(data.memberId);

        // 페이징 객체({ content: [...] }) 또는 배열 대응
        const modList = matches.content || matches || [];
        const validList = Array.isArray(modList) ? modList : [];

        // 데이터가 로드된 시점에는 profileData 상태가 아직 업데이트되지 않았을 수 있으므로
        // data(로컬 변수)를 직접 활용하여 매핑 로직 수행 필요.
        const transformedList = validList.map((raw) =>
          formatMatchData(raw, data),
        );

        // 최근 20개 유지 (API 기본값과 일치)
        const recentTwenty = transformedList.slice(0, 20);
        setMatchHistory(recentTwenty);
      }

      // 참가한 대회 목록 로드
      try {
        const drafts = await fetchDrafts({
          my_participation: true,
          size: 100,
          status: "ALL",
        });
        setParticipatingDrafts(drafts || []);
      } catch (draftErr) {
        console.error("참가 대회 로드 실패:", draftErr);
        setParticipatingDrafts([]);
      }
    } catch (err) {
      console.error("프로필 로드 실패:", err);
      setError("프로필 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 프로필 수정 핸들러
  const handleProfileUpdate = async (memberId, updateData) => {
    try {
      setProfileData((prev) => ({ ...prev, ...updateData }));
      await updateProfile(memberId, updateData);
      fetchProfileData();
      return { success: true };
    } catch (err) {
      console.error("프로필 수정 실패:", err);
      fetchProfileData();
      return { success: false, error: err.message };
    }
  };

  // 전적 갱신 핸들러
  const handleRefreshMatches = async (memberId, username) => {
    try {
      const status = await getRefreshStatus(username);
      if (status.refreshing)
        return { success: false, error: "이미 갱신 중입니다." };
      if (status.remainingCooldownSeconds > 0)
        return {
          success: false,
          error: `${status.remainingCooldownSeconds}초 후에 다시 시도해주세요.`,
        };

      await refreshMatches(memberId);
      await fetchProfileData();
      return { success: true };
    } catch (err) {
      console.error("전적 갱신 실패:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // 최근 20게임 기준 통계 계산 (Hooks 규칙: 조건문/early return 전에 호출)
  const recentStats = useMemo(
    () => calculateRecentStats(matchHistory),
    [matchHistory],
  );

  if (loading) {
    return (
      <div className="bg-background-dark flex min-h-screen items-center justify-center p-4 text-white md:p-10">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
          <p className="text-gray-400">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로필 데이터가 없으면 기본값 사용
  const displayData = profileData || {
    memberId: null,
    username: "-",
    gameName: "소환사",
    tagLine: "KR1",
    mainPosition: "TOP",
    subPosition: "JUNGLE",
    stats: null,
    mostChampions: [],
    bio: "",
  };

  return (
    <div className="bg-background-dark min-h-screen p-4 text-white md:p-10">
      {/* 에러 알림 배너 */}
      {error && (
        <div className="mx-auto mb-4 max-w-[1400px]">
          <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchProfileData}
              className="ml-4 rounded bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/30"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="mx-auto mb-10 max-w-[1400px]">
        <h1 className="mb-2 text-4xl font-bold text-white">내 프로필</h1>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-[1400px]">
        {/* 통합 프로필 카드 (MyProfile) */}
        <div className="mb-12">
          <MyProfile
            data={displayData}
            recentStats={recentStats}
            onProfileUpdate={profileData ? handleProfileUpdate : null}
            onRefreshMatches={profileData ? handleRefreshMatches : null}
          />
        </div>

        {/* 하단 섹션: 좌우 분할 (최근 전적 / 참가 대회) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 왼쪽: 최근 전적 */}
          <div>
            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-xl font-bold text-white">최근 전적</h2>
              <span className="text-xs font-normal text-gray-500">
                최근 개인/2인 랭크 및 자유 랭크 20게임 전적입니다.
              </span>
            </div>
            <RecentMatches matches={matchHistory} />
          </div>

          {/* 오른쪽: 참가한 대회 */}
          <div className="flex h-full flex-col">
            <h2 className="mb-4 text-xl font-bold text-white">참가한 대회</h2>
            <div className="flex-1">
              <ParticipatingTournaments tournaments={participatingDrafts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
