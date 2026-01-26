/**
 * Match Adapter
 * API에서 받아온 Raw Match Data를 프론트엔드 컴포넌트(`RecentMatches`)에서
 * 사용하기 쉬운 형태(View Model)로 변환합니다.
 *
 * @param {Object} raw - API로부터 받은 개별 매치 데이터
 * @param {Object} myProfile - 현재 로그인한(또는 조회 중인) 유저의 프로필 정보 ({ gameName, tagLine })
 * @returns {Object} 변환된 매치 데이터
 */
export const formatMatchData = (raw, myProfile) => {
  // 1. 내 데이터 찾기
  // participants 중 내 이름(gameName)과 일치하는 항목 찾기. 없으면 첫 번째 항목 Fallback
  const myData =
    raw.participants?.find(
      (p) =>
        p.summonerName === myProfile?.gameName ||
        p.tagLine === myProfile?.tagLine
    ) ||
    raw.participants?.[0] ||
    {}; // Fallback

  // 아이템, 스펠 ID -> URL 변환 헬퍼 (혹시 ID로 들어올 경우를 대비한 Fallback, 현재 API는 URL을 줌)
  // 필요 시 사용 가능하지만, 현재 로직에서는 API가 준 URL(itemUrls)을 우선 사용함.

  return {
    // 게임 메타 정보 (상위 객체)
    gameCreation: raw.gameCreation,
    gameDuration: raw.gameDuration,
    gameMode: raw.gameMode,
    matchId: raw.matchId,

    // 내 플레이 정보 (participant 객체)
    win: myData.win ?? false,
    kills: myData.kills ?? 0,
    deaths: myData.deaths ?? 0,
    assists: myData.assists ?? 0,
    kdaRatio: myData.kda?.toFixed(2) ?? "0.00",

    championName: myData.championName || "Unknown",
    championIconUrl: myData.championIconUrl,
    championLevel: myData.championLevel,

    // 이미 URL로 변환되어 들어오는 필드들
    items: myData.itemUrls || [],
    spells: myData.spellUrls || [],
    runes: myData.runeUrls || [],

    // 상세 스탯
    totalMinionsKilled: myData.totalMinionsKilled,
    cs: myData.totalMinionsKilled, // CS 매핑
    visionScore: myData.visionScore,
  };
};
