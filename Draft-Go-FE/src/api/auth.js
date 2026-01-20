import { instance } from "../libs/axios";

// 1. 회원가입 API
export const signup = async (userData) => {
  // username, password, gameName, tagLine 필요
  const response = await instance.post("/members/signup", userData);
  return response.data;
};

// 2. 로그인 API
export const login = async (loginData) => {
  // username, password 필요
  const response = await instance.post("/members/login", loginData);

  // 성공 시 응답 Body에 Access Token이 담겨 옵니다.
  return response.data;
};
