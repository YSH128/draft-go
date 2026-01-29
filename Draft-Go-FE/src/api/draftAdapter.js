/**
 * Draft Adapter
 * 백엔드 API 응답을 프론트엔드 UI 컴포넌트에서 사용하기 쉬운 형태로 변환합니다.
 * 누락된 필드에 대한 폴백 처리와 상태값 매핑을 담당합니다.
 */

import { formatRelativeTime } from '../utils/dateFormatter';

// 기본 썸네일 이미지 (LoL 협곡 관련 이미지들)
const DEFAULT_THUMBNAILS = [
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg',
];

// API 상태값 → UI 상태값 매핑 (TournamentCard/StatusBadge 호환)
const STATUS_MAP = {
  LOBBY: 'recruiting',
  RECRUITING: 'recruiting',
  IN_PROGRESS: 'in-progress',
  AUCTION: 'in-progress',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'completed',
};

// 상태별 한글 라벨
export const STATUS_LABELS = {
  recruiting: '모집중',
  'in-progress': '진행중',
  scheduled: '예정',
  completed: '완료',
};

// 필터 탭용 상태 상수
export const FILTER_STATUS = {
  ALL: 'all',
  RECRUITING: 'recruiting',
  IN_PROGRESS: 'in-progress',
  MY: 'my',
};

/**
 * 해시 기반 랜덤 인덱스 생성 (일관된 결과를 위해)
 * @param {string|number} seed
 * @param {number} max
 * @returns {number}
 */
const getHashIndex = (seed, max) => {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
};

/**
 * DiceBear API를 사용한 아바타 URL 생성
 * @param {string} seed - 사용자 이름 또는 ID
 * @returns {string} 아바타 이미지 URL
 */
const generateAvatarUrl = (seed) => {
  const safeSeed = encodeURIComponent(seed || 'anonymous');
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${safeSeed}`;
};

/**
 * 테스트용 랜덤 과거 시간 생성
 * @returns {string} ISO 8601 형식의 날짜 문자열
 */
const generateRandomPastTime = () => {
  const now = new Date();
  // 1분 ~ 48시간 전 사이의 랜덤 시간
  const randomMinutes = Math.floor(Math.random() * 60 * 48) + 1;
  now.setMinutes(now.getMinutes() - randomMinutes);
  return now.toISOString();
};

/**
 * 개별 드래프트 데이터 변환
 * @param {Object} raw - API에서 받은 원본 드래프트 데이터
 * @returns {Object} UI용으로 변환된 드래프트 데이터
 */
export const adaptDraft = (raw) => {
  const draftId = raw.draftId || raw.id;

  // 썸네일: API에서 제공하지 않으면 해시 기반 기본 이미지 선택
  const thumbnailUrl =
    raw.thumbnailUrl ||
    DEFAULT_THUMBNAILS[getHashIndex(draftId, DEFAULT_THUMBNAILS.length)];

  // 프로필 이미지: API에서 제공하지 않으면 DiceBear 아바타 생성
  const ownerName = raw.ownerName || raw.hostName || '익명';
  const ownerProfileImage =
    raw.ownerProfileImage ||
    raw.hostProfileImage ||
    generateAvatarUrl(ownerName);

  // 생성 시간: API에서 제공하지 않으면 테스트용 랜덤 시간 생성
  const createdAt = raw.createdAt || generateRandomPastTime();

  // 상태값 정규화 (UI 컴포넌트 호환 형식: lowercase + hyphen)
  const rawStatus = (raw.status || 'LOBBY').toUpperCase();
  const status = STATUS_MAP[rawStatus] || 'recruiting';

  // 참가자 수 계산
  const currentParticipants =
    raw.currentParticipants ?? raw.participantCount ?? raw.currentCount ?? 0;
  const maxParticipants =
    raw.maxParticipants ?? raw.maxTeamCount ?? raw.maxCount ?? 8;

  return {
    // 기본 정보
    id: draftId,
    title: raw.title || '제목 없음',
    status,
    statusLabel: STATUS_LABELS[status],

    // 소유자 정보
    ownerName,
    ownerProfileImage,
    ownerId: raw.ownerId || raw.hostId,

    // 이미지
    thumbnailUrl,

    // 참가자 정보
    currentParticipants,
    maxParticipants,
    participantText: `${currentParticipants}/${maxParticipants}`,

    // 시간 정보
    createdAt,
    createdAtRelative: formatRelativeTime(createdAt),
    startTime: raw.startTime,
    startTimeRelative: raw.startTime ? formatRelativeTime(raw.startTime) : null,

    // 게임 설정
    startPrice: raw.startPrice ?? 0,
    startPoint: raw.startPoint ?? 0,

    // 원본 데이터 보존 (디버깅용)
    _raw: raw,
  };
};

/**
 * 드래프트 목록 변환
 * @param {Array} rawList - API에서 받은 드래프트 배열
 * @returns {Array} 변환된 드래프트 배열
 */
export const adaptDraftList = (rawList) => {
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map(adaptDraft);
};

/**
 * 상태별 드래프트 필터링
 * @param {Array} drafts - 변환된 드래프트 배열
 * @param {string} filterKey - 필터 키 ('all', 'recruiting', 'in-progress', 'my')
 * @param {number|null} currentUserId - 현재 로그인한 사용자 ID (my 필터용)
 * @returns {Array} 필터링된 드래프트 배열
 */
export const filterDraftsByStatus = (drafts, filterKey, currentUserId = null) => {
  if (!filterKey || filterKey === 'all') return drafts;

  if (filterKey === 'my') {
    // 현재 사용자가 참여 중인 드래프트 필터링 (추후 구현)
    if (!currentUserId) return [];
    return drafts.filter((draft) => draft.ownerId === currentUserId || draft.isParticipating);
  }

  return drafts.filter((draft) => draft.status === filterKey);
};
