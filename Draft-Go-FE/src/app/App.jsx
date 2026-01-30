import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./router";
import useAuthStore from "../stores/useAuthStore";
import { getMyProfile } from "../api/auth";

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;

