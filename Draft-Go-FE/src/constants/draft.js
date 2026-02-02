/**
 * Draft 관련 상수 정의
 * 백엔드 API 상태값과 프론트엔드 UI 상태값을 중앙에서 관리합니다.
 */

// ============================================================
// API 상태값 (백엔드에서 내려주는 값)
// ============================================================
export const API_DRAFT_STATUS = {
  LOBBY: 'LOBBY',           // 모집중 (대기방)
  IN_DRAFT: 'IN_DRAFT',     // 진행중 (경매)
  COMPLETED: 'COMPLETED',   // 종료
  // 백엔드 호환용 별칭
  RECRUITING: 'RECRUITING',
  IN_PROGRESS: 'IN_PROGRESS',
  AUCTION: 'AUCTION',
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED',
};

// ============================================================
// UI 상태값 (프론트엔드 컴포넌트에서 사용하는 값)
// ============================================================
export const UI_DRAFT_STATUS = {
  RECRUITING: 'recruiting',     // 모집중
  IN_PROGRESS: 'in-progress',   // 진행중
  SCHEDULED: 'scheduled',       // 예정
  COMPLETED: 'completed',       // 완료
};

// ============================================================
// API → UI 상태값 매핑
// ============================================================
export const STATUS_API_TO_UI = {
  [API_DRAFT_STATUS.LOBBY]: UI_DRAFT_STATUS.RECRUITING,
  [API_DRAFT_STATUS.RECRUITING]: UI_DRAFT_STATUS.RECRUITING,
  [API_DRAFT_STATUS.IN_DRAFT]: UI_DRAFT_STATUS.IN_PROGRESS,
  [API_DRAFT_STATUS.IN_PROGRESS]: UI_DRAFT_STATUS.IN_PROGRESS,
  [API_DRAFT_STATUS.AUCTION]: UI_DRAFT_STATUS.IN_PROGRESS,
  [API_DRAFT_STATUS.SCHEDULED]: UI_DRAFT_STATUS.SCHEDULED,
  [API_DRAFT_STATUS.COMPLETED]: UI_DRAFT_STATUS.COMPLETED,
  [API_DRAFT_STATUS.CANCELLED]: UI_DRAFT_STATUS.COMPLETED,
};

// ============================================================
// 상태별 한글 라벨
// ============================================================
export const STATUS_LABELS = {
  [UI_DRAFT_STATUS.RECRUITING]: '모집중',
  [UI_DRAFT_STATUS.IN_PROGRESS]: '진행중',
  [UI_DRAFT_STATUS.SCHEDULED]: '예정',
  [UI_DRAFT_STATUS.COMPLETED]: '완료',
};

// ============================================================
// 필터 탭용 상태 상수 (UI용)
// ============================================================
export const FILTER_STATUS = {
  ALL: 'all',
  RECRUITING: UI_DRAFT_STATUS.RECRUITING,
  IN_PROGRESS: UI_DRAFT_STATUS.IN_PROGRESS,
  MY: 'my',
};

// ============================================================
// UI 필터값 → API status 파라미터 변환
// ============================================================
export const UI_FILTER_TO_API_STATUS = {
  all: 'ALL',
  [UI_DRAFT_STATUS.RECRUITING]: API_DRAFT_STATUS.LOBBY,
  [UI_DRAFT_STATUS.IN_PROGRESS]: API_DRAFT_STATUS.IN_DRAFT,
};

// ============================================================
// 필터값 → API 요청 파라미터 빌더
// ============================================================
const DEFAULT_PAGE_SIZE = 100;

/**
 * UI 필터값을 API 요청 파라미터로 변환
 * @param {string} filter - UI 필터값 ('all', 'recruiting', 'in-progress', 'my')
 * @returns {Object} API 요청 파라미터
 */
export const buildFilterParams = (filter) => {
  const baseParams = { size: DEFAULT_PAGE_SIZE };

  if (filter === FILTER_STATUS.MY) {
    return { ...baseParams, my_participation: true, status: 'ALL' };
  }

  const apiStatus = UI_FILTER_TO_API_STATUS[filter];
  return { ...baseParams, status: apiStatus || 'ALL' };
};

// ============================================================
// 상태별 라우트 경로 매핑
// ============================================================
export const STATUS_ROUTES = {
  [UI_DRAFT_STATUS.RECRUITING]: (id) => `/draft/room/${id}`,
  [UI_DRAFT_STATUS.IN_PROGRESS]: (id) => `/draft?draftId=${id}`,
  [UI_DRAFT_STATUS.COMPLETED]: (id) => `/result?draftId=${id}`,
  [UI_DRAFT_STATUS.SCHEDULED]: (id) => `/draft/room/${id}`,
};

// ============================================================
// 상태별 버튼 설정
// ============================================================
export const STATUS_BUTTON_CONFIG = {
  [UI_DRAFT_STATUS.RECRUITING]: {
    label: '참가하기',
    variant: 'primary',
    handler: 'onJoin',
  },
  [UI_DRAFT_STATUS.IN_PROGRESS]: {
    label: '관전하기',
    variant: 'secondary',
    handler: 'onSpectate',
  },
  [UI_DRAFT_STATUS.SCHEDULED]: {
    label: '알림받기',
    variant: 'secondary',
    handler: 'onNotify',
  },
  [UI_DRAFT_STATUS.COMPLETED]: {
    label: '결과보기',
    variant: 'ghost',
    handler: 'onJoin',
  },
};
