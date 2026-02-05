// WebSocket Base URL
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || '/ws';

// Lobby Socket Events
export const LOBBY_SOCKET_EVENTS = {
  ROLE_CHANGED: 'ROLE_CHANGED',
  POSITION_CHANGED: 'POSITION_CHANGED',
  PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT: 'PARTICIPANT_LEFT',
  LEADER_POINT_CHANGED: 'LEADER_POINT_CHANGED',
  READY_STATUS_CHANGED: 'READY_STATUS_CHANGED',
  INVITE_CODE_REFRESHED: 'INVITE_CODE_REFRESHED',
  DRAFT_STARTED: 'DRAFT_STARTED',
  DRAFT_DESTROYED: 'DRAFT_DESTROYED', // 백엔드와 동일하게 변경
  REFRESH_REQUIRED: 'REFRESH_REQUIRED',
};

// Topic Path Constructor
export const getLobbyTopic = (draftId) => `/topic/lobby/${draftId}`;

// Chat Message Types
export const CHAT_MESSAGE_TYPES = {
  CHAT: "CHAT",
  JOIN: "JOIN",
  LEAVE: "LEAVE",
  SYSTEM: "SYSTEM",
};

// Chat Topic Generator Functions
export const getChatTopic = (draftId) => `/topic/chat/${draftId}`;
export const getChatPublishPath = (draftId) => `/app/chat/${draftId}`;

// Draft/Auction Event Types
// NOTE: 백엔드는 /ws/auction/{draftId} 토픽으로 모든 경매 이벤트를 전송
// 이벤트 타입: ROUND_START, BID, ROUND_ENDED, AUCTION_ENDED
export const AUCTION_EVENT_TYPES = {
  ROUND_START: 'ROUND_START',
  BID: 'BID',
  ROUND_ENDED: 'ROUND_ENDED',
  AUCTION_ENDED: 'AUCTION_ENDED', // 경매 완전 종료
};

// TODO: 백엔드와 협의 후 확정
// Draft Status Events (드래프트 상태 변경 이벤트)
export const DRAFT_STATUS_EVENTS = {
  STATUS_CHANGED: 'DRAFT_STATUS_CHANGED',
  COMPLETED: 'COMPLETED',      // 경매 완료
  IN_PROGRESS: 'IN_PROGRESS',  // 경매 진행 중
  // PAUSED: 'PAUSED',         // 필요시 추가
};

// TODO: 백엔드와 토픽 경로 확인 필요
// Draft Status Topic Generator
export const getDraftStatusTopic = (draftId) => `/topic/draft/${draftId}/status`;
