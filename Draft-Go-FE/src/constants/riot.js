// Position Icons
import topIcon from "../assets/positions/top.svg";
import jungleIcon from "../assets/positions/jungle.svg";
import midIcon from "../assets/positions/mid.svg";
import botIcon from "../assets/positions/bot.png";
import supIcon from "../assets/positions/sup.svg";

export const POSITIONS = [
  { id: "TOP", icon: topIcon, label: "TOP" },
  { id: "JUNGLE", icon: jungleIcon, label: "JUNGLE" },
  { id: "MID", icon: midIcon, label: "MID" },
  { id: "BOT", icon: botIcon, label: "BOT" },
  { id: "SUP", icon: supIcon, label: "SUP" },
];

export const TIERS = [
  // 상위 티어
  { value: "CHALLENGER", label: "챌린저" },
  { value: "GRANDMASTER", label: "그마" },
  { value: "MASTER", label: "마스터" },

  // 다이아몬드
  { value: "DIAMOND_1", label: "다이아 1" },
  { value: "DIAMOND_2", label: "다이아 2" },
  { value: "DIAMOND_3", label: "다이아 3" },
  { value: "DIAMOND_4", label: "다이아 4" },

  // 에메랄드
  { value: "EMERALD_1", label: "에메랄드 1" },
  { value: "EMERALD_2", label: "에메랄드 2" },
  { value: "EMERALD_3", label: "에메랄드 3" },
  { value: "EMERALD_4", label: "에메랄드 4" },

  // 플래티넘
  { value: "PLATINUM_1", label: "플래티넘 1" },
  { value: "PLATINUM_2", label: "플래티넘 2" },
  { value: "PLATINUM_3", label: "플래티넘 3" },
  { value: "PLATINUM_4", label: "플래티넘 4" },

  // 골드
  { value: "GOLD_1", label: "골드 1" },
  { value: "GOLD_2", label: "골드 2" },
  { value: "GOLD_3", label: "골드 3" },
  { value: "GOLD_4", label: "골드 4" },

  // 실버
  { value: "SILVER_1", label: "실버 1" },
  { value: "SILVER_2", label: "실버 2" },
  { value: "SILVER_3", label: "실버 3" },
  { value: "SILVER_4", label: "실버 4" },

  // 브론즈
  { value: "BRONZE_1", label: "브론즈 1" },
  { value: "BRONZE_2", label: "브론즈 2" },
  { value: "BRONZE_3", label: "브론즈 3" },
  { value: "BRONZE_4", label: "브론즈 4" },

  // 아이언
  { value: "IRON_1", label: "아이언 1" },
  { value: "IRON_2", label: "아이언 2" },
  { value: "IRON_3", label: "아이언 3" },
  { value: "IRON_4", label: "아이언 4" },

  // 미정의 랭크
  { value: "UNRANKED", label: "언랭" },
];

// 티어 value로 한글 label 반환
export const getTierLabel = (tierValue) => {
  if (!tierValue) return "";
  const found = TIERS.find((t) => t.value === tierValue);
  return found?.label ?? tierValue;
};

// 티어 value로 색상 키 반환
export const getTierColorKey = (tierValue) => {
  if (!tierValue) return "default";

  if (tierValue === "CHALLENGER") return "challenger";
  if (tierValue === "GRANDMASTER") return "grandmaster";
  if (tierValue === "MASTER") return "master";
  if (tierValue.startsWith("DIAMOND")) return "diamond";
  if (tierValue.startsWith("EMERALD")) return "emerald";
  if (tierValue.startsWith("PLATINUM")) return "platinum";
  if (tierValue.startsWith("GOLD")) return "gold";
  if (tierValue.startsWith("SILVER")) return "silver";
  if (tierValue.startsWith("BRONZE")) return "bronze";
  if (tierValue.startsWith("IRON")) return "iron";

  return "default";
};
