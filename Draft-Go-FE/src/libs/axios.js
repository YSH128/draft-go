import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const instance = axios.create({
  baseURL: BASE_URL || '/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 추가: 토큰이 있으면 헤더에 자동 포함
instance.interceptors.request.use(
  (config) => {
    // localStorage에서 accessToken 가져오기 (Zustand persist middleware 사용 시)
    const storage = localStorage.getItem("auth-storage");
    const parsedStorage = storage ? JSON.parse(storage) : null;
    const token = parsedStorage?.state?.accessToken;
    
    // 만약 만료된 토큰이거나 없다면 생략
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
