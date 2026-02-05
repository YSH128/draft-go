/**
 * 포지션 매핑 유틸리티
 * UI와 API 간 포지션 표기 변환
 */

/**
 * UI 포지션을 API 포지션으로 변환
 * @param {string} position - UI 포지션 (JNG, ADC 등)
 * @returns {string} API 포지션 (JUNGLE, BOT 등)
 */
export const mapPositionToAPI = (position) => {
    const mapping = { 
        'JNG': 'JUNGLE', 
        'ADC': 'BOT' 
    };
    return mapping[position] || position;
};

/**
 * API 포지션을 UI 포지션으로 변환
 * @param {string} position - API 포지션 (JUNGLE, BOT 등)
 * @returns {string} UI 포지션 (JNG, ADC 등)
 */
export const mapPositionToUI = (position) => {
    const mapping = { 
        'JUNGLE': 'JNG', 
        'BOT': 'ADC' 
    };
    return mapping[position] || position;
};
