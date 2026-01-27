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

// 3. 아이디 중복 확인 API
export const checkUsernameDuplicate = async (username) => {
  const response = await instance.get(`/members/check/username`, {
    params: { username },
  });
  return response.data;
};

// 4. 소환사 중복 확인 API
export const checkSummonerDuplicate = async (gameName, tagLine) => {
  const response = await instance.get(`/members/check/summoner`, {
    params: { gameName, tagLine },
  });
  return response.data;
};

// 5. 내 프로필 조회 API
export const getMyProfile = async () => {
  const response = await instance.get("/members/me");
  return response.data;
};
