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
  { value: "UNRANKED", label: "언랭" },
  { value: "IRON", label: "아이언" },
  { value: "BRONZE", label: "브론즈" },
  { value: "SILVER", label: "실버" },
  { value: "GOLD", label: "골드" },
  { value: "PLATINUM", label: "플래티넘" },
  { value: "EMERALD", label: "에메랄드" },
  { value: "DIAMOND", label: "다이아" },
  { value: "MASTER", label: "마스터" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "CHALLENGER", label: "챌린저" },
];

// Division이 있는 티어 목록 (1~4 디비전)
export const STANDARD_TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
];
