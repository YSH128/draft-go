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
  let myData = null;

  // [0순위] 비상 대책: 1명만 있다면 그 사람이 '나' (백엔드 필터링 가정)
  if (raw.participants && raw.participants.length === 1) {
    myData = raw.participants[0];
  } else {
    // 정규화 함수 (공백 제거, 소문자 변환)
    const normalize = (str) => (str ? str.replace(/\s+/g, "").toLowerCase() : "");

    // [1순위] PUUID로 비교 (가장 정확함)
    if (myProfile?.puuid && raw.participants) {
      myData = raw.participants.find((p) => p.puuid === myProfile.puuid);
    }

    // [2순위] 이름 + 태그로 비교 (PUUID가 없거나 못 찾은 경우)
    if (!myData) {
      const myGameName = normalize(myProfile?.gameName);
      const myTagLine = normalize(myProfile?.tagLine);

      myData = raw.participants?.find((p) => {
        // API 응답 필드명 확인: riotIdGameName/riotIdTagLine 또는 summonerName(구버전)
        const pGameName = normalize(p.riotIdGameName);
        const pSummonerName = normalize(p.summonerName);
        const pTagLine = normalize(p.riotIdTagLine || p.tagLine);

        // 1. 이름 + 태그 모두 일치 (가장 정확)
        if (myGameName && myTagLine && pGameName && pTagLine) {
          if (pGameName === myGameName && pTagLine === myTagLine) return true;
        }

        // 2. 태그 없이 이름만 일치 (Riot ID 우선)
        if (myGameName && pGameName && pGameName === myGameName) return true;

        // 3. 구버전 summonerName으로 일치
        if (myGameName && pSummonerName && pSummonerName === myGameName) return true;

        return false;
      });
    }
  }

  // [디버깅] 여전히 못 찾은 경우 로그 출력 (상세 정보 포함)
  if (!myData) { // myData를 못 찾은 경우만 에러 처리
    // Fallback: 빈 객체 (이 경우 UI에서 "알 수 없음" 등으로 표시될 수 있음)
    myData = {}; 
  }

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
