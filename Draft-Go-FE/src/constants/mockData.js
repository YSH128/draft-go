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
};
