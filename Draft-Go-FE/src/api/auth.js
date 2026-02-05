import { instance } from "../libs/axios";

// 1. 회원가입 API
export const signup = async (userData) => {
  // username, password, gameName, tagLine, mainPosition, subPosition 필요
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

// 4. 소환사 실존 여부 검증 (Riot API)
export const verifySummoner = async (gameName, tagLine) => {
  // GET /api/v1/members/check/riot-id?gameName=...&tagLine=...
  const response = await instance.get(`/members/check/riot-id`, {
    params: { gameName, tagLine },
  });
  return response.data;
};

// 5. 내 정보 조회 API
export const getMyProfile = async () => {
  const response = await instance.get("/members/me");
  return response.data;
};

// 6. 로그아웃 API
export const logout = async () => {
  const response = await instance.post("/members/logout");
  return response.data;
};
