import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const instance = axios.create({
  baseURL: BASE_URL || '/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. 요청 인터셉터 (토큰 주입)
instance.interceptors.request.use(
  (config) => {
    // Zustand persist 형식에서 토큰 가져오기
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("토큰 파싱 실패:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 응답 인터셉터 (세션 만료 처리)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== "/login") {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);