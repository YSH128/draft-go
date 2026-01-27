import { useEffect } from "react";
import AppRouter from "./router";
import useAuthStore from "../stores/useAuthStore";
import { getMyProfile } from "../api/auth";

function App() {
  const { accessToken, user, login } = useAuthStore();

  // 앱 시작 시 토큰이 있고 user 정보가 없으면 자동으로 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (accessToken && !user?.id) {
        try {
          console.log('[App] 토큰 있음, user 정보 로드 중...');
          const userInfo = await getMyProfile();
          login(accessToken, {
            id: userInfo.memberId,
            username: userInfo.username,
            gameName: userInfo.gameName,
            tagLine: userInfo.tagLine,
          });
          console.log('[App] User 정보 로드 완료:', userInfo);
        } catch (error) {
          console.error('[App] User 정보 로드 실패:', error);
        }
      }
    };

    loadUserProfile();
  }, [accessToken, user, login]);

  return <AppRouter />;
}

export default App;
