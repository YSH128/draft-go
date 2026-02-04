/**
 * Wallpaper 관리 상수
 * 서버에는 식별자만 저장하고, 프론트엔드에서 실제 이미지 경로로 매핑합니다.
 */

import wallpaper1 from '../assets/wallpaper/draft-go-wallpaper-1.png';
import wallpaper2 from '../assets/wallpaper/draft-go-wallpaper-2.png';
import wallpaper3 from '../assets/wallpaper/draft-go-wallpaper-3.png';
import wallpaper4 from '../assets/wallpaper/draft-go-wallpaper-4.png';
import wallpaper5 from '../assets/wallpaper/draft-go-wallpaper-5.png';

// 서버에 저장할 논리적 식별자
export const WALLPAPER_IDS = {
    WALLPAPER_1: 'wallpaper-1',
    WALLPAPER_2: 'wallpaper-2',
    WALLPAPER_3: 'wallpaper-3',
    WALLPAPER_4: 'wallpaper-4',
    WALLPAPER_5: 'wallpaper-5',
};

// ID -> 실제 import된 이미지 경로 매핑
export const WALLPAPER_ID_TO_IMAGE = {
    [WALLPAPER_IDS.WALLPAPER_1]: wallpaper1,
    [WALLPAPER_IDS.WALLPAPER_2]: wallpaper2,
    [WALLPAPER_IDS.WALLPAPER_3]: wallpaper3,
    [WALLPAPER_IDS.WALLPAPER_4]: wallpaper4,
    [WALLPAPER_IDS.WALLPAPER_5]: wallpaper5,
};

// 실제 이미지 경로 -> ID 역매핑 (UI에서 선택 -> 서버 전송 시 사용)
export const WALLPAPER_IMAGE_TO_ID = {
    [wallpaper1]: WALLPAPER_IDS.WALLPAPER_1,
    [wallpaper2]: WALLPAPER_IDS.WALLPAPER_2,
    [wallpaper3]: WALLPAPER_IDS.WALLPAPER_3,
    [wallpaper4]: WALLPAPER_IDS.WALLPAPER_4,
    [wallpaper5]: WALLPAPER_IDS.WALLPAPER_5,
};

// UI에서 선택할 수 있는 목록 (실제 이미지 경로)
export const WALLPAPERS = [wallpaper1, wallpaper2, wallpaper3, wallpaper4, wallpaper5];

// 기본 wallpaper
export const DEFAULT_WALLPAPER_ID = WALLPAPER_IDS.WALLPAPER_1;

/**
 * Wallpaper ID를 실제 이미지 경로로 변환
 * @param {string} id - Wallpaper 식별자
 * @returns {string|null} 실제 이미지 경로 또는 null
 */
export function getWallpaperImageById(id) {
    if (!id) return null;
    return WALLPAPER_ID_TO_IMAGE[id] || null;
}

/**
 * 실제 이미지 경로를 Wallpaper ID로 변환
 * @param {string} imagePath - 실제 이미지 경로
 * @returns {string|null} Wallpaper ID 또는 null
 */
export function getWallpaperIdByImage(imagePath) {
    if (!imagePath) return null;
    return WALLPAPER_IMAGE_TO_ID[imagePath] || null;
}
