import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../stores/useAuthStore";
import Avatar from "../ui/Avatar";
import PageLoader from "../ui/PageLoader";
import logo from "../../assets/logo/draft-go-logo.png";
import { logout as logoutAPI } from "../../api/auth";

// 프로필 아이콘 URL 생성 함수
const getProfileIconUrl = (user) => {
  if (!user) return null;

  // 백엔드에서 제공하는 profileIconUrl이 있으면 우선 사용
  if (user.profileIconUrl) return user.profileIconUrl;

  // 없으면 기본 아이콘 사용
  return "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/1.png";
};

const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. 백엔드 로그아웃 API 호출 (refreshToken 무효화)
      await logoutAPI();
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
      // API 실패해도 클라이언트 로그아웃은 진행
    }

    // 2. 클라이언트 상태 초기화 (accessToken, refreshToken 제거)
    logout();

    // 3. 완전한 페이지 새로고침으로 모든 상태 초기화
    // (Tournament Section 필터, React Query 캐시 등 모두 리셋)
    window.location.href = "/";
  };

  return (
    <>
      <header className="flex h-[80px] w-full items-center justify-between bg-[var(--color-header-bg)] px-8 shadow-md">
        {/* Left: Logo & Branding */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Draft-GO Logo" className="h-[55px] w-auto drop-shadow-[0_0_1px_#c89b3c]" />
          <span className="font-display text-xl font-bold text-white tracking-wide">
            Draft-GO
          </span>
        </Link>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* 프로필 영역 (클릭 가능) */}
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-[var(--color-primary)]/10 group"
              >
                {/* 프로필 아이콘 */}
                <Avatar
                  src={getProfileIconUrl(user)}
                  alt={`${user.gameName}#${user.tagLine}`}
                  size="sm"
                  className="ring-1 ring-gray-700 group-hover:ring-[var(--color-primary)]"
                />

                {/* 사용자 이름 */}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">
                    {user.gameName}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-[var(--color-primary)]/70 transition-colors">
                    #{user.tagLine}
                  </span>
                </div>
              </Link>

              {/* 관리자 링크 (admin만 표시) */}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="rounded border border-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-black"
                >
                  관리자
                </Link>
              )}

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="rounded border border-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-[var(--color-primary)]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-black transition-all hover:bg-[var(--color-hextech-gold-dark)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>
      {/* 로그아웃 중 로딩 화면 */}
      {isLoggingOut && <PageLoader message="로그아웃 중..." />}
    </>
  );
};

export default Header;
