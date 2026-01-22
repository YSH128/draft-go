import React from 'react';

/**
 * PositionIcon - 포지션별 아이콘을 표시하는 재사용 가능한 컴포넌트
 * @param {string} position - 포지션 이름 ('TOP', 'JNG', 'MID', 'ADC', 'SUP')
 * @param {string} className - 추가 CSS 클래스
 */
export default function PositionIcon({ position, className = "" }) {
  const getIconName = () => {
    switch(position) {
      case 'TOP':
        return 'stat_1';
      case 'JNG':
        return 'forest';
      case 'MID':
        return 'lan';
      case 'ADC':
        return 'target';
      case 'SUP':
        return 'flare';
      default:
        return 'help';
    }
  };

  return (
    <span className={`material-symbols-outlined ${className}`}>
      {getIconName()}
    </span>
  );
}
