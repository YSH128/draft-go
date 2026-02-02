/**
 * Profile Adapter
 * 백엔드 API 응답을 프론트엔드 UI 컴포넌트에서 사용하기 쉬운 형태로 변환합니다.
 * 필드명 불일치 해소 및 티어/Division 정규화를 담당합니다.
 */

/**
 * 프로필 데이터 변환
 * @param {Object} raw - API에서 받은 원본 프로필 데이터
 * @returns {Object|null} UI용으로 변환된 프로필 데이터
 */
export const adaptProfile = (raw) => {
  if (!raw) return null;

  // 티어 정보 정규화 (stats 객체 내부에서 추출)
  const tier = raw.stats?.tier || 'UNRANKED';
  const division = raw.stats?.division || '';

  return {
    // 기본 필드 유지 (spread)
    ...raw,

    // 티어 정보 정규화
    tier,
    division,
    tierDisplay: division ? `${tier} ${division}` : tier, // 예: "EMERALD I"

    // 통계 (백엔드 데이터 신뢰 - 재계산 없음)
    stats: raw.stats || {},

    // UI 호환성 매핑
    avatarUrl: raw.profileIconUrl,
    username: raw.username,  // 로그인 아이디 (gameName과 별개)
  };
};
