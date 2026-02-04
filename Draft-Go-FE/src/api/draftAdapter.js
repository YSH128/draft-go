/**
 * Draft Adapter
 * 백엔드 API 응답을 프론트엔드 UI 컴포넌트에서 사용하기 쉬운 형태로 변환합니다.
 * 누락된 필드에 대한 폴백 처리와 상태값 매핑을 담당합니다.
 */

import { formatRelativeTime } from '../utils/dateFormatter';
import {
  UI_DRAFT_STATUS,
  STATUS_API_TO_UI,
  STATUS_LABELS,
  FILTER_STATUS,
  UI_FILTER_TO_API_STATUS,
} from '../constants/draft';
import {
  getWallpaperImageById
} from '../constants/wallpapers';

// Re-export constants for backward compatibility
export { STATUS_LABELS, FILTER_STATUS, UI_FILTER_TO_API_STATUS };

// 기본 썸네일 이미지 (Riot CDN - LoL 고퀄리티 배경)
const DEFAULT_THUMBNAILS = [
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg',
];

/**
 * 유효한 썸네일 URL인지 검사
 * - Mock 데이터(picsum, placeholder 등)는 무효 처리
 * @param {string} url
 * @returns {boolean}
 */
const isValidThumbnailUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const invalidPatterns = ['picsum', 'placeholder', 'via.placeholder', 'placehold'];
  return !invalidPatterns.some((pattern) => url.toLowerCase().includes(pattern));
};

/**
 * Deterministic 썸네일 URL 결정
 * - Wallpaper ID면 실제 이미지 경로로 변환
 * - 유효한 URL이 있으면 그대로 사용
 * - 없거나 Mock 데이터면 draftId 기반 고정 이미지 할당
 * @param {string|null} apiUrl - API에서 받은 URL
 * @param {number|string} draftId - 드래프트 ID
 * @returns {string}
 */
const getDeterministicThumbnail = (apiUrl, draftId) => {
  if (!apiUrl || typeof apiUrl !== 'string') {
    // URL이 없으면 기본 이미지 할당
    const numericId = typeof draftId === 'number' ? draftId : parseInt(draftId, 10) || 0;
    const index = Math.abs(numericId) % DEFAULT_THUMBNAILS.length;
    return DEFAULT_THUMBNAILS[index];
  }

  // 1. Wallpaper ID 형식인지 확인 (wallpaper-1, wallpaper-2, etc.)
  const wallpaperImage = getWallpaperImageById(apiUrl);
  if (wallpaperImage) {
    return wallpaperImage;
  }

  // 2. 유효한 외부 URL인지 확인
  if (isValidThumbnailUrl(apiUrl)) {
    return apiUrl;
  }

  // 3. 모두 실패하면 draftId 기반 기본 이미지 할당
  const numericId = typeof draftId === 'number' ? draftId : parseInt(draftId, 10) || 0;
  const index = Math.abs(numericId) % DEFAULT_THUMBNAILS.length;
  return DEFAULT_THUMBNAILS[index];
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

  // 썸네일: Deterministic 방식으로 결정 (Mock 데이터 필터링 포함)
  const thumbnailUrl = getDeterministicThumbnail(raw.thumbnailUrl, draftId);

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
  const status = STATUS_API_TO_UI[rawStatus] || UI_DRAFT_STATUS.RECRUITING;

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

    // 참여 상태 (백엔드 API에서 제공 - myParticipant)
    isParticipating: raw.myParticipant || false,

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

// ============================================================================
// Draft Result Adapter
// ============================================================================

// 팀 색상 목록 (순차 할당용)
const TEAM_COLORS = ['Red', 'Blue', 'Green', 'Purple'];

// 티어 점수화 (평균 계산용) - 높을수록 상위 티어
const TIER_SCORES = {
  CHALLENGER: 2700,
  GRANDMASTER: 2600,
  MASTER: 2500,
  DIAMOND: 2000,
  EMERALD: 1600,
  PLATINUM: 1200,
  GOLD: 800,
  SILVER: 400,
  BRONZE: 200,
  IRON: 0,
  UNRANKED: 0,
};

// Division 점수 (I=4, II=3, III=2, IV=1)
const DIVISION_SCORES = { I: 100, II: 75, III: 50, IV: 25 };

/**
 * 티어 + 디비전을 점수로 변환
 */
const getTierScore = (tier, division) => {
  if (!tier || tier === 'UNRANKED') return 0;
  const baseTier = tier.toUpperCase();
  const baseScore = TIER_SCORES[baseTier] || 0;
  // MASTER, GRANDMASTER, CHALLENGER는 디비전 없음
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(baseTier)) {
    return baseScore;
  }
  const divScore = DIVISION_SCORES[division] || 0;
  return baseScore + divScore;
};

/**
 * 점수를 다시 티어 문자열로 변환
 */
const scoreToTierString = (score) => {
  if (score >= 2700) return 'CHALLENGER';
  if (score >= 2600) return 'GRANDMASTER';
  if (score >= 2500) return 'MASTER';

  // 디비전이 있는 티어들
  const tiers = [
    { name: 'DIAMOND', min: 2000 },
    { name: 'EMERALD', min: 1600 },
    { name: 'PLATINUM', min: 1200 },
    { name: 'GOLD', min: 800 },
    { name: 'SILVER', min: 400 },
    { name: 'BRONZE', min: 200 },
    { name: 'IRON', min: 0 },
  ];

  for (const { name, min } of tiers) {
    if (score >= min) {
      const diff = score - min;
      let div = 4;
      if (diff >= 75) div = 1;
      else if (diff >= 50) div = 2;
      else if (diff >= 25) div = 3;
      return `${name}_${div}`;
    }
  }

  return 'UNRANKED';
};

/**
 * 티어+디비전 → "GOLD_1" 형식 변환
 */
const formatTierString = (tier, division) => {
  if (!tier || tier === 'UNRANKED') return 'UNRANKED';
  const upperTier = tier.toUpperCase();
  // MASTER, GRANDMASTER, CHALLENGER는 디비전 없음
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(upperTier)) {
    return upperTier;
  }
  const divNum = { I: 1, II: 2, III: 3, IV: 4 }[division] || 1;
  return `${upperTier}_${divNum}`;
};

/**
 * 팀 평균 티어 계산
 */
const calculateAverageTier = (players) => {
  if (!players || players.length === 0) return 'UNRANKED';

  const validPlayers = players.filter((p) => p.tier && p.tier !== 'UNRANKED');
  if (validPlayers.length === 0) return 'UNRANKED';

  const totalScore = validPlayers.reduce(
    (sum, p) => sum + getTierScore(p.tier, p.division),
    0
  );
  const avgScore = Math.round(totalScore / validPlayers.length);
  return scoreToTierString(avgScore);
};

/**
 * 드래프트 결과 데이터 변환
 * @param {Object} raw - API 응답 원본 (DraftResultResponse)
 * @param {number|string|null} currentMemberId - 현재 로그인한 사용자 ID
 * @returns {Array} 변환된 팀 배열 (TeamCard 컴포넌트 호환)
 */
export const adaptDraftResult = (raw, currentMemberId) => {
  if (!raw || !raw.teams) return [];

  // currentMemberId를 문자열로 정규화 (null/undefined 체크)
  const myId = currentMemberId != null ? String(currentMemberId) : null;

  return raw.teams.map((team, index) => {
    const players = team.players || [];

    // 팀장 찾기
    const leader = players.find((p) => p.isLeader);

    // Key Player 찾기 (NEW: 팀장 제외, 공동 수상 지원)
    // 1. 팀장이 아닌 후보들만 필터링
    const candidates = players.filter((p) => !p.isLeader);
    // 2. 후보 중 최고 입찰액 찾기
    const maxBid = Math.max(0, ...candidates.map((p) => p.bidPrice || 0));
    // 3. 최고 입찰액을 가진 선수들의 memberId Set (공동 수상 처리)
    const keyPlayerIds = new Set(
      maxBid > 0
        ? candidates
          .filter((p) => (p.bidPrice || 0) === maxBid)
          .map((p) => String(p.memberId))
        : []
    );

    // 선수 데이터 변환
    const mappedPlayers = players.map((player) => {
      const playerId = String(player.memberId);
      const isMe = myId !== null && playerId === myId;
      const isKeyPlayer = keyPlayerIds.has(playerId);

      return {
        memberId: player.memberId,
        role: player.position,
        tierRank: formatTierString(player.tier, player.division),
        name: player.gameName,
        tagLine: player.tagLine,
        profileIconUrl: player.profileIconUrl,
        isMe,
        isLeader: player.isLeader || false,
        isKeyPlayer,
        bidPrice: player.bidPrice || 0,
      };
    });

    // 내 팀 여부 확인 (변환된 players 기반)
    const isMyTeam = mappedPlayers.some((p) => p.isMe);

    return {
      id: team.teamId,
      leaderName: leader?.gameName || team.teamName || `팀 ${index + 1}`,
      teamColor: TEAM_COLORS[index % TEAM_COLORS.length],
      averageTier: calculateAverageTier(players),
      isMyTeam,
      finalPoint: team.finalPoint ?? 0,
      spentPoint: team.spentPoint ?? 0,
      players: mappedPlayers,
    };
  });
};
