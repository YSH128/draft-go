/**
 * Tier 계산 및 색상 유틸리티
 */

// Tier 텍스트 색상 매핑
export const TIER_TEXT_COLORS = {
    challenger: "text-[#0AC8B9]", // Electric Blue
    grandmaster: "text-[var(--color-tier-grandmaster-text)]",
    master: "text-[var(--color-tier-master-text)]",
    diamond: "text-[var(--color-tier-diamond-text)]",
    emerald: "text-[var(--color-tier-emerald-text)]",
    platinum: "text-[var(--color-tier-platinum-text)]",
    gold: "text-[var(--color-tier-gold-text)]",
    silver: "text-[var(--color-tier-silver-text)]",
    bronze: "text-[var(--color-tier-bronze-text)]",
    iron: "text-[var(--color-tier-iron-text)]",
    manager: "text-[#666]",
    observer: "text-[#666]"
};

// Tier 순서 (낮은 순)
export const TIER_ORDER = [
    "iron", "bronze", "silver", "gold", "platinum", "emerald",
    "diamond", "master", "grandmaster", "challenger"
];

// Division 점수 매핑
export const DIV_MAP = { 
    "I": 3, "II": 2, "III": 1, "IV": 0,
    "i": 3, "ii": 2, "iii": 1, "iv": 0
};

// Division 역순 (점수 → 로마자)
export const DIV_REVERSE = ["IV", "III", "II", "I"];

/**
 * Tier에 따른 텍스트 색상 클래스 반환
 * @param {string} tier - Tier 이름
 * @returns {string} Tailwind CSS 클래스
 */
export const getTierTextClass = (tier) => {
    if (!tier) return "text-[#bab29c]";
    const tierLower = tier.toLowerCase();
    return TIER_TEXT_COLORS[tierLower] || `text-[var(--color-tier-${tierLower}-text)]`;
};

/**
 * Tier와 Division을 점수로 변환
 * @param {string} tierStr - Tier 이름
 * @param {string} divisionStr - Division (I, II, III, IV)
 * @returns {number} Tier 점수 (0~39)
 */
export const getTierScore = (tierStr, divisionStr) => {
    if (!tierStr) return 0;

    const tier = tierStr.toLowerCase();
    const div = divisionStr || (TIER_ORDER.indexOf(tier) >= 7 ? "I" : "IV");

    const tierIdx = TIER_ORDER.indexOf(tier);
    if (tierIdx === -1) return 0;

    let score = tierIdx * 4;

    // Master 이상은 Division 없음
    if (tierIdx >= 7) {
        return score;
    }

    score += (DIV_MAP[div] !== undefined ? DIV_MAP[div] : 0);
    return score;
};

/**
 * 점수를 Tier와 Division으로 역변환
 * @param {number} score - Tier 점수
 * @returns {Object} { name, division, baseTier, color }
 */
export const getTierFromScore = (score) => {
    const tierIdx = Math.floor(score / 4);
    const divScore = Math.round(score % 4);

    const clampedTierIdx = Math.max(0, Math.min(tierIdx, TIER_ORDER.length - 1));
    const tierName = TIER_ORDER[clampedTierIdx];
    const baseTierName = tierName.charAt(0).toUpperCase() + tierName.slice(1);

    // Master 이상은 Division 없음
    if (clampedTierIdx >= 7) {
        return {
            name: baseTierName,
            baseTier: baseTierName,
            color: getTierTextClass(tierName)
        };
    }

    const divStr = DIV_REVERSE[divScore] || "IV";

    return {
        name: `${baseTierName} ${divStr}`,
        division: divStr,
        baseTier: baseTierName,
        color: getTierTextClass(tierName)
    };
};

/**
 * 참가자 목록의 평균 Tier 계산
 * @param {Array} participants - 참가자 배열
 * @returns {Object} { name, baseTier, color }
 */
export const calculateAverageTier = (participants) => {
    if (!participants || participants.length === 0) {
        return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
    }

    let sum = 0;
    let count = 0;

    participants.forEach(p => {
        if (p.tier && p.tier !== "Unranked") {
            sum += getTierScore(p.tier, p.division);
            count++;
        }
    });

    if (count === 0) {
        return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
    }

    const avg = Math.round(sum / count);
    return getTierFromScore(avg);
};
