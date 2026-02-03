import { instance as api } from '../libs/axios';
import { adaptDraftList } from './draftAdapter';

// Draft Room & Lobby API

// API 상태값 상수 (Swagger 스펙 기준)
export const DRAFT_STATUS = {
  ALL: 'ALL',
  LOBBY: 'LOBBY',
  IN_DRAFT: 'IN_DRAFT',
  COMPLETED: 'COMPLETED',
};

/**
 * 드래프트 목록 조회 (Raw 데이터)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} [params.status] - 상태 필터 (ALL, LOBBY, IN_DRAFT, COMPLETED)
 * @param {boolean} [params.my_participation] - 내가 참여한 대회만 조회
 */
export const getDraftListRaw = async (params = {}) => {
    const response = await api.get('/drafts', { params });
    return response.data;
};

/**
 * 드래프트 목록 조회 (Adapter 적용)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} [params.status] - 상태 필터 (ALL, LOBBY, IN_DRAFT, COMPLETED)
 * @param {boolean} [params.my_participation] - 내가 참여한 대회만 조회
 */
export const getDraftList = async (params = {}) => {
    const response = await api.get('/drafts', { params });
    return adaptDraftList(response.data);
};

/**
 * 드래프트 목록 조회 (fetchDrafts alias)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} [params.status] - 상태 필터 (ALL, LOBBY, IN_DRAFT, COMPLETED)
 * @param {boolean} [params.my_participation] - 내가 참여한 대회만 조회
 */
export const fetchDrafts = async (params = {}) => {
    return getDraftList(params);
};

/**
 * 드래프트 방 생성
 * @param {Object} data { title, maxTeamCount, startPrice, startPoint }
 */
export const createDraftRoom = async (data) => {
    const response = await api.post('/drafts', data);
    return response.data;
};

/**
 * 드래프트 정보 수정 (관리자 전용)
 * @param {number|string} draftId
 * @param {Object} data { title, maxTeamCount, startPrice, startPoint }
 */
export const updateDraft = async (draftId, data) => {
    const response = await api.put(`/drafts/${draftId}`, data);
    return response.data;
};

/**
 * 드래프트 방 참가
 * @param {Object} data { draftCode, position }
 */
export const joinDraftRoom = async (data) => {
  const response = await api.post('/drafts/join', data);
  return response.data;
};

/**
 * 드래프트 방 삭제 (관리자 나가기 시)
 * @param {number|string} draftId
 */
export const deleteDraft = async (draftId) => {
    const response = await api.delete(`/drafts/${draftId}`);
    return response.data;
};

/**
 * 드래프트 방 폭파 (관리자 전용)
 * 로비 상태의 드래프트를 강제 삭제하고 모든 참가자를 퇴장시킵니다.
 * @param {number|string} draftId
 */
export const destroyDraft = async (draftId) => {
    const response = await api.delete(`/drafts/${draftId}/lobby/destroy`);
    return response.data;
};


/**
 * 로비 정보 조회 (초대 코드 포함 - 관리자만)
 * @param {number|string} draftId
 */
export const getDraftLobby = async (draftId) => {
  const response = await api.get(`/drafts/${draftId}/lobby`);
  return response.data;
};

/**
 * 초대 코드 리프레시 (관리자 전용)
 * @param {number|string} draftId
 * @param {string} codeType 'LEADER' | 'MEMBER'
 */
export const refreshInviteCode = async (draftId, codeType) => {
  const response = await api.post(`/drafts/${draftId}/lobby/refresh-code`, { codeType });
  return response.data;
};


// Participant Management

/**
 * 역할 변경 (관리자 전용) - 팀장 <-> 팀원(대기열)
 * @param {number|string} draftId
 * @param {Object} data { targetUserId, role: 'LEADER' | 'MEMBER' }
 */
export const changeRole = async (draftId, data) => {
  const response = await api.post(`/drafts/${draftId}/lobby/change-role`, data);
  return response.data;
};

/**
 * 포지션 변경
 * @param {number|string} draftId
 * @param {Object} data { targetUserId, position: 'TOP' | 'JUNGLE' ... }
 */
export const changePosition = async (draftId, data) => {
  const response = await api.post(`/drafts/${draftId}/lobby/change-position`, data);
  return response.data;
};

/**
 * 참가자 퇴장/강퇴
 * @param {number|string} draftId
 * @param {number|string} userId
 */
export const kickParticipant = async (draftId, userId) => {
    // URL 파라미터로 userId 전달
    const response = await api.delete(`/drafts/${draftId}/lobby/kick/${userId}`);
    return response.data;
};

/**
 * 준비 완료 토글 (팀장 전용)
 * @param {number|string} draftId
 * @param {boolean} isReady
 */
export const toggleReady = async (draftId, isReady) => {
    const response = await api.post(`/drafts/${draftId}/lobby/ready`, { isReady });
    return response.data;
};

/**
 * 팀장 포인트 설정 (관리자 전용)
 * @param {number|string} draftId
 * @param {Object} data { leaderId, point }
 */
export const setLeaderPoint = async (draftId, data) => {
    const response = await api.post(`/drafts/${draftId}/lobby/leader-point`, data);
    return response.data;
};

// Game Flow

/**
 * 드래프트 시작 (관리자 전용)
 * @param {number|string} draftId
 */
export const startDraft = async (draftId) => {
    const response = await api.post(`/drafts/${draftId}/lobby/start`);
    return response.data;
};

/**
 * 드래프트 결과 조회
 * @param {number|string} draftId
 */
export const getDraftResult = async (draftId) => {
    const response = await api.get(`/drafts/${draftId}/result`);
    return response.data;
};

// Match API

/**
 * 전적 갱신
 * @param {number|string} memberId
 */
export const refreshMemberData = async (memberId) => {
    const response = await api.post(`/matches/${memberId}/refresh`);
    return response.data;
};

/**
 * 회원 정보 상세 조회
 * @param {number|string} memberId
 */
export const getMemberProfile = async (memberId) => {
    const response = await api.get(`/members/${memberId}`);
    return response.data;
};

/**
 * 전적 히스토리 조회 (최근 20게임 등)
 * @param {number|string} memberId 
 * @param {number} page 
 * @param {number} size 
 */
export const getMatchHistory = async (memberId, page = 0, size = 20) => {
    const response = await api.get(`/matches/history/${memberId}`, {
        params: { page, size }
    });
    return response.data;
};

// --------------- draft management ----------------------------------------------

export const getAuctionState = async (draftId) => {
  const response = await api.get(`/auctions/${draftId}`);
  return response.data;
};

export const getDraftQueue = async (draftId) => {
  const response = await api.get(`/auctions/${draftId}/queue`);
  return response.data;
};

export const getTeamInfos = async (draftId) => {
  const response = await api.get(`/auctions/${draftId}/teams`);
  return response.data;
};

export const startAuction = async (draftId) => {
  const response = await api.post(`/auctions/${draftId}/start`);
  return response.data;
};

export const placeBid = async (draftId, teamId, price) => {
  const response = await api.post(`/auctions/${draftId}/bid`, {
    teamId,
    price,
  });
  return response.data;
};
