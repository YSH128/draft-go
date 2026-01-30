import { useState, useEffect, useCallback } from "react";
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
        const transformedList = validList.map((raw) => formatMatchData(raw, data));

        // 1. 최근 10개만 유지
        const recentTen = transformedList.slice(0, 10);
        setMatchHistory(recentTen);
      }

      // 참가한 대회 목록 로드
      try {
        const drafts = await fetchDrafts({ my_participation: true });
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
      if (status.refreshing) return { success: false, error: "이미 갱신 중입니다." };
      if (status.remainingCooldownSeconds > 0) return { success: false, error: `${status.remainingCooldownSeconds}초 후에 다시 시도해주세요.` };
      
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

  if (loading) {
    return (
      <div className="bg-background-dark min-h-screen p-4 text-white md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로필 데이터가 없으면 기본값 사용 (백엔드 stats 데이터 신뢰)
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
              className="ml-4 rounded bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors"
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
            onProfileUpdate={profileData ? handleProfileUpdate : null}
            onRefreshMatches={profileData ? handleRefreshMatches : null}
          />
        </div>

        {/* 하단 섹션: 좌우 분할 (최근 전적 / 참가 대회) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 최근 전적 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">최근 전적</h2>
            <RecentMatches matches={matchHistory} />
          </div>

          {/* 오른쪽: 참가한 대회 */}
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-4">참가한 대회</h2>
            <div className="flex-1">
              <ParticipatingTournaments
                tournaments={participatingDrafts}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
