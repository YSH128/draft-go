// 1. 티어 색상 반환
export const getTierColor = (tierString) => {
  if (!tierString) return "default";
  const tier = tierString.toUpperCase();

  if (tier.includes("CHALLENGER") || tier.includes("CHAL")) return "challenger";
  if (tier.includes("GRAND") || tier.includes("GRANDMASTER"))
    return "grandmaster";
  if (tier.includes("MASTER")) return "master";
  if (tier.includes("DIAMOND") || tier.includes("DIA")) return "diamond";
  if (tier.includes("EMERALD") || tier.includes("EME")) return "emerald";
  if (tier.includes("PLATINUM") || tier.includes("PLAT")) return "platinum";
  if (tier.includes("GOLD")) return "gold";
  if (tier.includes("SILVER")) return "silver";
  if (tier.includes("BRONZE")) return "bronze";
  if (tier.includes("IRON")) return "iron";

  return "default";
};

export const formatTierName = (tierString) => {
  if (!tierString) return "";
  let tier = tierString.toUpperCase();

  // 1. 특수 티어
  if (tier.includes("CHALLENGER") || tier.includes("CHAL")) return "챌린저";
  if (tier.includes("GRAND") || tier.includes("GRANDMASTER")) return "그마";
  if (tier.includes("MASTER")) return "마스터";

  // 2. 단계가 있는 티어
  tier = tier.replace("EMERALD", "에메랄드");
  tier = tier.replace("EME", "에메랄드");
  tier = tier.replace("PLATINUM", "플래티넘");
  tier = tier.replace("PLAT", "플래티넘");
  tier = tier.replace("DIAMOND", "다이아");
  tier = tier.replace("DIA", "다이아");
  tier = tier.replace("GOLD", "골드");
  tier = tier.replace("SILVER", "실버");
  tier = tier.replace("BRONZE", "브론즈");
  tier = tier.replace("IRON", "아이언");

  return tier;
};
