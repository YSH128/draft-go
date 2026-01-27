import { instance } from "../libs/axios";

// 내 정보 조회 (전적/통계 포함)
export const getMyProfile = async () => {
  const response = await instance.get("/members/me");
  return response.data;
};

// 특정 회원 정보 조회
export const getMemberProfile = async (memberId) => {
  const response = await instance.get(`/members/${memberId}`);
  return response.data;
};

// 프로필 수정 (포지션)
export const updateProfile = async (memberId, data) => {
  const response = await instance.put(`/members/${memberId}/profile`, data);
  return response.data;
};

// 전적 갱신 (수동)
export const refreshMatches = async (memberId) => {
  const response = await instance.post(`/matches/${memberId}/refresh`);
  return response.data;
};

// 전적 갱신 상태 확인
export const getRefreshStatus = async (username) => {
  const response = await instance.get(`/matches/${username}/status`);
  return response.data;
};

// 매치 히스토리 조회
export const getMatchHistory = async (memberId, page = 0, size = 20) => {
  const response = await instance.get(`/matches/history/${memberId}`, {
    params: { page, size },
  });
  return response.data;
};
