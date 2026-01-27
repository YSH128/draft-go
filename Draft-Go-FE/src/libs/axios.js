import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const createClient = () =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

export const instance = createClient();
const refreshInstance = createClient();

const isAuthRefreshTarget = (config) => {
  const url = config?.url || "";
  return (
    url.includes("/members/login") ||
    url.includes("/members/signup") ||
    url.includes("/members/reissue")
  );
};

const shouldRefresh = (error) => {
  const status = error?.response?.status;
  if (status !== 401) return false;
  const code = error?.response?.data?.code;
  return code === "EXPIRED_TOKEN" || code === "INVALID_TOKEN" || code === "MISSING_TOKEN";
};

instance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (isAuthRefreshTarget(originalRequest) || !shouldRefresh(error)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await refreshInstance.post("/members/reissue");
      const newAccessToken = refreshResponse?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      const { login, user } = useAuthStore.getState();
      login(newAccessToken, user);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return instance(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);
