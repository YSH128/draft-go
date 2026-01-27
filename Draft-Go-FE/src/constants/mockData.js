export const DRAFT_RESULT_MOCK_DATA = [
  // 1. Faker 팀 (내 팀)
  {
    id: 1,
    leaderName: "Faker",
    teamColor: "Red",
    isMyTeam: true,
    averageTier: "DIAMOND_2",
    players: [
      { role: "TOP", tier: "DIAMOND_1", name: "Hide on bush", isMe: true },
      { role: "JUNGLE", tier: "DIAMOND_2", name: "Cuzz" },
      { role: "MID", tier: "CHALLENGER", name: "Faker" },
      { role: "BOT", tier: "DIAMOND_3", name: "Gumayusi" },
      { role: "SUP", tier: "EMERALD_1", name: "Keria" },
    ],
  },
  // 2. Showmaker 팀
  {
    id: 2,
    leaderName: "Showmaker",
    teamColor: "Blue",
    isMyTeam: false,
    averageTier: "EMERALD_1",
    players: [
      { role: "TOP", tier: "EMERALD_2", name: "Kingen" },
      { role: "JUNGLE", tier: "DIAMOND_4", name: "Canyon" },
      { role: "MID", tier: "GRANDMASTER", name: "Showmaker" },
      { role: "BOT", tier: "EMERALD_1", name: "Deft" },
      { role: "SUP", tier: "EMERALD_3", name: "Beryl" },
    ],
  },
  // 3. Chovy 팀
  {
    id: 3,
    leaderName: "Chovy",
    teamColor: "Green",
    isMyTeam: false,
    averageTier: "DIAMOND_4",
    players: [
      { role: "TOP", tier: "DIAMOND_4", name: "Doran" },
      { role: "JUNGLE", tier: "EMERALD_1", name: "Peanut" },
      { role: "MID", tier: "CHALLENGER", name: "Chovy" },
      { role: "BOT", tier: "DIAMOND_3", name: "Peyz" },
      { role: "SUP", tier: "DIAMOND_4", name: "Delight" },
    ],
  },
  // 4. Bdd 팀
  {
    id: 4,
    leaderName: "Bdd",
    teamColor: "Purple",
    isMyTeam: false,
    averageTier: "DIAMOND_3",
    players: [
      { role: "TOP", tier: "DIAMOND_2", name: "Kiin" },
      { role: "JUNGLE", tier: "DIAMOND_3", name: "Cuzz" },
      { role: "MID", tier: "MASTER", name: "Bdd" },
      { role: "BOT", tier: "DIAMOND_1", name: "Aiming" },
      { role: "SUP", tier: "DIAMOND_2", name: "Lehends" },
    ],
  },
  // 5. Zeka 팀
  {
    id: 5,
    leaderName: "Zeka",
    teamColor: "Red",
    isMyTeam: false,
    averageTier: "EMERALD_2",
    players: [
      { role: "TOP", tier: "EMERALD_1", name: "DuDu" },
      { role: "JUNGLE", tier: "EMERALD_2", name: "Clid" },
      { role: "MID", tier: "GRANDMASTER", name: "Zeka" },
      { role: "BOT", tier: "EMERALD_1", name: "Viper" },
      { role: "SUP", tier: "DIAMOND_4", name: "Life" },
    ],
  },
  // 6. Rookie 팀
  {
    id: 6,
    leaderName: "Rookie",
    teamColor: "Blue",
    isMyTeam: false,
    averageTier: "MASTER",
    players: [
      { role: "TOP", tier: "MASTER", name: "TheShy" },
      { role: "JUNGLE", tier: "DIAMOND_1", name: "Ning" },
      { role: "MID", tier: "CHALLENGER", name: "Rookie" },
      { role: "BOT", tier: "MASTER", name: "JackeyLove" },
      { role: "SUP", tier: "DIAMOND_1", name: "Baolan" },
    ],
  },
  // 7. Scout 팀
  {
    id: 7,
    leaderName: "Scout",
    teamColor: "Green",
    isMyTeam: false,
    averageTier: "DIAMOND_1",
    players: [
      { role: "TOP", tier: "DIAMOND_2", name: "Flandre" },
      { role: "JUNGLE", tier: "DIAMOND_1", name: "Jiejie" },
      { role: "MID", tier: "GRANDMASTER", name: "Scout" },
      { role: "BOT", tier: "DIAMOND_2", name: "GALA" },
      { role: "SUP", tier: "DIAMOND_3", name: "Meiko" },
    ],
  },
  // 8. Caps 팀
  {
    id: 8,
    leaderName: "Caps",
    teamColor: "Purple",
    isMyTeam: false,
    averageTier: "PLATINUM_1",
    players: [
      { role: "TOP", tier: "PLATINUM_1", name: "BrokenBlade" },
      { role: "JUNGLE", tier: "PLATINUM_2", name: "Yike" },
      { role: "MID", tier: "DIAMOND_1", name: "Caps" },
      { role: "BOT", tier: "PLATINUM_1", name: "Hans Sama" },
      { role: "SUP", tier: "PLATINUM_3", name: "Mikyx" },
    ],
  },
  // 9. Doinb 팀
  {
    id: 9,
    leaderName: "Doinb",
    teamColor: "Red",
    isMyTeam: false,
    averageTier: "MASTER",
    players: [
      { role: "TOP", tier: "MASTER", name: "GimGoon" },
      { role: "JUNGLE", tier: "DIAMOND_1", name: "Tian" },
      { role: "MID", tier: "CHALLENGER", name: "Doinb" },
      { role: "BOT", tier: "MASTER", name: "Lwx" },
      { role: "SUP", tier: "DIAMOND_1", name: "Crisp" },
    ],
  },
  // 10. Ambition 팀
  {
    id: 10,
    leaderName: "Ambition",
    teamColor: "Blue",
    isMyTeam: false,
    averageTier: "EMERALD_3",
    players: [
      { role: "TOP", tier: "EMERALD_2", name: "CuVee" },
      { role: "JUNGLE", tier: "DIAMOND_4", name: "Ambition" },
      { role: "MID", tier: "EMERALD_1", name: "Crown" },
      { role: "BOT", tier: "EMERALD_3", name: "Ruler" },
      { role: "SUP", tier: "EMERALD_2", name: "CoreJJ" },
    ],
  },
];

export const USER_PROFILE_MOCK_DATA = {
  // 1. API 명세서 기반 회원 정보 (GET /api/v1/members/me)
  memberId: 9007199254740991,
  username: "user_id_123", // 로그인 아이디
  gameName: "Hide on bush", // 소환사명
  tagLine: "KR1", // 태그
  mainPosition: "TOP", // API Enum: TOP, JUNGLE, MID, BOT, SUP
  subPosition: "JUNGLE",

  // 2. UI 표시용 추가 정보 (API에는 없지만 화면에 필요함)
  level: 154,
  tier: "DIAMOND_4",
  avatarUrl:
    "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon1625.jpg",
  introduction:
    "승리를 향해 나아가는 소환사입니다.\n탑/정글 위주로 플레이합니다.",

  // 3. 선호 챔피언 (TOP 3)
  topChampions: [
    { name: "Aatrox", image: "aatrox.png" },
    { name: "Lee Sin", image: "leesin.png" },
    { name: "Ahri", image: "ahri.png" },
  ],

  // 4. 참가 중인 대회 목록 (보안 설정 대신 들어갈 내용)
  participatingTournaments: [
    {
      id: 101,
      name: "2024 자낳대 시즌 1",
      status: "ONGOING", // 진행중
      date: "2024.03.15",
      myTeam: {
        id: 1,
        leaderName: "Faker",
        teamColor: "Red",
        isMyTeam: true,
        averageTier: "Diamond 2",
        players: [
          { role: "TOP", tier: "DIAMOND_1", name: "Hide on bush", isMe: true },
          { role: "JUNGLE", tier: "DIAMOND_2", name: "Cuzz" },
          { role: "MID", tier: "CHALLENGER", name: "Faker" },
          { role: "BOT", tier: "DIAMOND_3", name: "Gumayusi" },
          { role: "SUP", tier: "EMERALD_1", name: "Keria" },
        ],
      },
    },
    {
      id: 102,
      name: "제 3회 멸망전",
      status: "FINISHED", // 종료됨
      date: "2024.01.20",
      myTeam: {
        id: 5,
        leaderName: "Ambition",
        teamColor: "Blue",
        isMyTeam: true,
        averageTier: "Emerald 1",
        players: [
          { role: "TOP", tier: "EMERALD_2", name: "Khan" },
          { role: "JUNGLE", tier: "DIAMOND_4", name: "Ambition", isMe: true }, // 포지션 변경 예시
          { role: "MID", tier: "EMERALD_1", name: "Crown" },
          { role: "BOT", tier: "EMERALD_3", name: "Ruler" },
          { role: "SUP", tier: "EMERALD_2", name: "CoreJJ" },
        ],
      },
    },
  ],

  // 5. 최근 전적 요약 정보
  matchSummary: {
    totalGames: 20,
    wins: 10,
    losses: 10,
    winRate: 50,
    avgKills: 4.4,
    avgDeaths: 5.0,
    avgAssists: 11.2,
    kdaRatio: "3.11:1",
    killParticipation: "54%",
    recentChampions: [
      {
        name: "LeeSin",
        icon: "https://opgg-static.akamaized.net/meta/images/lol/champion/LeeSin.png",
        winRate: 46,
        wins: 6,
        losses: 7,
        kda: "3.32:1 평점",
      },
      {
        name: "Aatrox",
        icon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Aatrox.png",
        winRate: 40,
        wins: 2,
        losses: 3,
        kda: "1.76:1 평점",
      },
      {
        name: "Thresh",
        icon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Thresh.png",
        winRate: 100,
        wins: 2,
        losses: 0,
        kda: "40.00:1 평점",
      },
    ],
    preferredPositions: [
      { position: "TOP", games: 8, percentage: 40 },
      { position: "JUNGLE", games: 5, percentage: 25 },
      { position: "MID", games: 3, percentage: 15 },
      { position: "BOT", games: 2, percentage: 10 },
      { position: "SUP", games: 2, percentage: 10 },
    ],
  },

  // 6. 최근 전적 (New - OP.GG Style)
  matchHistory: [
    {
      id: 201,
      championName: "LeeSin",
      championIconUrl:
        "https://opgg-static.akamaized.net/meta/images/lol/champion/LeeSin.png",
      result: "WIN",
      gameType: "개인/2인 랭크 게임",
      gameDate: "1일 전",
      gameDuration: "25분 12초",
      championLevel: 16,
      spells: [
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerFlash.png",
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerSmite.png",
      ],
      runes: [
        "https://opgg-static.akamaized.net/meta/images/lol/perk/8010.png",
        "https://opgg-static.akamaized.net/meta/images/lol/perkStyle/8300.png",
      ],
      kda: "12 / 2 / 5",
      kdaRatio: "8.50:1 평점",
      laneScore: "72 : 28",
      killParticipation: "62%",
      cs: "185 (7.4)",
      averageTier: "Diamond 3",
      rank: "1st",
      multiKill: "트리플킬",
      badges: ["MVP"],
      items: [
        "https://opgg-static.akamaized.net/meta/images/lol/item/3181.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3071.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3047.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/6333.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3053.png",
        "",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3364.png",
      ],
      participants: {
        myTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Aatrox.png", summonerName: "탑의신", isMe: false },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/LeeSin.png", summonerName: "Hide on bush", isMe: true },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Ahri.png", summonerName: "미드갓", isMe: false },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Jinx.png", summonerName: "원딜러", isMe: false },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Thresh.png", summonerName: "서폿장인", isMe: false },
        ],
        enemyTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Garen.png", summonerName: "가렌장인" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Elise.png", summonerName: "정글러" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Zed.png", summonerName: "제드마스터" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Caitlyn.png", summonerName: "케이틀린" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Lulu.png", summonerName: "룰루" },
        ],
      },
    },
    {
      id: 202,
      championName: "Sett",
      championIconUrl:
        "https://opgg-static.akamaized.net/meta/images/lol/champion/Sett.png",
      result: "LOSE",
      gameType: "개인/2인 랭크 게임",
      gameDate: "26분 전",
      gameDuration: "35분 00초",
      championLevel: 16,
      spells: [
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerFlash.png",
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerTeleport.png",
      ],
      runes: [
        "https://opgg-static.akamaized.net/meta/images/lol/perk/8010.png",
        "https://opgg-static.akamaized.net/meta/images/lol/perkStyle/8400.png",
      ],
      kda: "6 / 8 / 9",
      kdaRatio: "1.88:1 평점",
      laneScore: "34 : 66",
      killParticipation: "63%",
      cs: "188 (5.4)",
      averageTier: "Gold 4",
      rank: "7th",
      multiKill: "더블킬",
      badges: ["불굴의 의지"],
      items: [
        "https://opgg-static.akamaized.net/meta/images/lol/item/6631.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3047.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3071.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3053.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3742.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/6333.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3364.png",
      ],
      participants: {
        myTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Sett.png", summonerName: "ferero", isMe: true },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Graves.png", summonerName: "브라키오..." },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Sylas.png", summonerName: "나혼자산다" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Aphelios.png", summonerName: "청송교도..." },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Nautilus.png", summonerName: "롤토체스..." },
        ],
        enemyTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Renekton.png", summonerName: "화가없는..." },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Nidalee.png", summonerName: "아따그려..." },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Viktor.png", summonerName: "영민돼지" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Draven.png", summonerName: "성난싸움꾼" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Leona.png", summonerName: "히 온" },
        ],
      },
    },
    {
      id: 203,
      championName: "Aatrox",
      championIconUrl:
        "https://opgg-static.akamaized.net/meta/images/lol/champion/Aatrox.png",
      result: "WIN",
      gameType: "개인/2인 랭크 게임",
      gameDate: "3일 전",
      gameDuration: "21분 40초",
      championLevel: 15,
      spells: [
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerFlash.png",
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerTeleport.png",
      ],
      runes: [
        "https://opgg-static.akamaized.net/meta/images/lol/perk/8010.png",
        "https://opgg-static.akamaized.net/meta/images/lol/perkStyle/8400.png",
      ],
      kda: "8 / 1 / 4",
      kdaRatio: "12.0:1 평점",
      laneScore: "68 : 32",
      killParticipation: "73%",
      cs: "190 (8.9)",
      averageTier: "Diamond 4",
      rank: "2nd",
      multiKill: null,
      badges: ["솔로킬"],
      items: [
        "https://opgg-static.akamaized.net/meta/images/lol/item/6630.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3111.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3071.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3053.png",
        "",
        "",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3364.png",
      ],
      participants: {
        myTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Aatrox.png", summonerName: "Hide on bush", isMe: true },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Viego.png", summonerName: "정글왕" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Syndra.png", summonerName: "신드라장인" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Kaisa.png", summonerName: "카이사" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Leona.png", summonerName: "레오나" },
        ],
        enemyTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Darius.png", summonerName: "다리우스" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/LeeSin.png", summonerName: "리신장인" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Orianna.png", summonerName: "오리아나" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Ezreal.png", summonerName: "이즈리얼" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Nami.png", summonerName: "나미" },
        ],
      },
    },
    {
      id: 204,
      championName: "Ezreal",
      championIconUrl:
        "https://opgg-static.akamaized.net/meta/images/lol/champion/Ezreal.png",
      result: "LOSE",
      gameType: "칼바람 나락",
      gameDate: "4일 전",
      gameDuration: "19분 20초",
      championLevel: 13,
      spells: [
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerFlash.png",
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerHeal.png",
      ],
      runes: [
        "https://opgg-static.akamaized.net/meta/images/lol/perk/8005.png",
        "https://opgg-static.akamaized.net/meta/images/lol/perkStyle/8300.png",
      ],
      kda: "2 / 4 / 2",
      kdaRatio: "1.00:1 평점",
      laneScore: null,
      killParticipation: "35%",
      cs: "120 (6.2)",
      averageTier: "-",
      rank: "8th",
      multiKill: null,
      badges: [],
      items: [
        "https://opgg-static.akamaized.net/meta/images/lol/item/3078.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3158.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3042.png",
        "",
        "",
        "",
        "https://opgg-static.akamaized.net/meta/images/lol/item/2052.png",
      ],
      participants: {
        myTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Lux.png", summonerName: "럭스" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Ezreal.png", summonerName: "Hide on bush", isMe: true },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Ashe.png", summonerName: "애쉬" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Brand.png", summonerName: "브랜드" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Veigar.png", summonerName: "베이가" },
        ],
        enemyTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Samira.png", summonerName: "사미라" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Sona.png", summonerName: "소나" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/MissFortune.png", summonerName: "미스포츈" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Seraphine.png", summonerName: "세라핀" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Ziggs.png", summonerName: "직스" },
        ],
      },
    },
    {
      id: 205,
      championName: "Thresh",
      championIconUrl:
        "https://opgg-static.akamaized.net/meta/images/lol/champion/Thresh.png",
      result: "WIN",
      gameType: "개인/2인 랭크 게임",
      gameDate: "5일 전",
      gameDuration: "28분 15초",
      championLevel: 14,
      spells: [
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerFlash.png",
        "https://opgg-static.akamaized.net/meta/images/lol/spell/SummonerDot.png",
      ],
      runes: [
        "https://opgg-static.akamaized.net/meta/images/lol/perk/8439.png",
        "https://opgg-static.akamaized.net/meta/images/lol/perkStyle/8300.png",
      ],
      kda: "1 / 2 / 15",
      kdaRatio: "8.00:1 평점",
      laneScore: "55 : 45",
      killParticipation: "78%",
      cs: "35 (1.2)",
      averageTier: "Diamond 4",
      rank: "3rd",
      multiKill: null,
      badges: ["시야 장악"],
      items: [
        "https://opgg-static.akamaized.net/meta/images/lol/item/3190.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3117.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3109.png",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3050.png",
        "",
        "",
        "https://opgg-static.akamaized.net/meta/images/lol/item/3364.png",
      ],
      participants: {
        myTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Jayce.png", summonerName: "제이스" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Kindred.png", summonerName: "킨드레드" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Azir.png", summonerName: "아지르" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Vayne.png", summonerName: "베인" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Thresh.png", summonerName: "Hide on bush", isMe: true },
        ],
        enemyTeam: [
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Camille.png", summonerName: "카밀" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Hecarim.png", summonerName: "헤카림" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Yone.png", summonerName: "요네" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Jhin.png", summonerName: "진" },
          { championIcon: "https://opgg-static.akamaized.net/meta/images/lol/champion/Yuumi.png", summonerName: "유미" },
        ],
      },
    },
  ],
};
