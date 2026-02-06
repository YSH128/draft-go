import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./router";
import useAuthStore from "../stores/useAuthStore";
import { getMyProfile } from "../api/auth";
import PageLoader from "../components/ui/PageLoader";

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
  const { accessToken, user, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // 앱 시작 시 토큰 검증
  useEffect(() => {
    const verifyToken = async () => {
      // 토큰이 없으면 초기화 완료
      if (!accessToken) {
        setIsInitializing(false);
        return;
      }

      // 토큰이 있으면 유효성 검증
      try {
        console.log('[App] 토큰 검증 중...');
        const userInfo = await getMyProfile();

        // 사용자 정보가 없으면 저장
        if (!user?.id) {
          login(accessToken, {
            id: userInfo.memberId,
            username: userInfo.username,
            gameName: userInfo.gameName,
            tagLine: userInfo.tagLine,
            profileIconUrl: userInfo.profileIconUrl,
            role: userInfo.role,
          });
          console.log('[App] 토큰 유효, 사용자 정보 로드 완료', userInfo);
        }
      } catch (error) {
        console.error('[App] 토큰 검증 실패, 로그아웃 처리:', error);
        // 토큰이 만료되었거나 유효하지 않으면 로그아웃
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    verifyToken();
  }, []); // 최초 마운트 시에만 실행

  // 초기화 중에는 로딩 화면 표시
  if (isInitializing) {
    return <PageLoader message="인증 확인 중..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;

