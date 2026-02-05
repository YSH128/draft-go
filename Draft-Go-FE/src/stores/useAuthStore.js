import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      user: null,

      login: (token, user = null) => {
        set({
          accessToken: token,
          isAuthenticated: true,
          user: user,
        });
      },

      logout: () => {
        // localStorage에서 refreshToken 제거 (자동 갱신 방지)
        localStorage.removeItem("refreshToken");
        set({
          accessToken: null,
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: "auth-storage", // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => localStorage), // 기본값이므로 생략 가능하나 명시
    }
  )
);

export default useAuthStore;
