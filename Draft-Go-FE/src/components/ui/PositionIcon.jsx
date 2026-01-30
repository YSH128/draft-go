import React from 'react';

import topIcon from '../../assets/positions/top.svg';
import jngIcon from '../../assets/positions/jungle.svg';
import midIcon from '../../assets/positions/mid.svg';
import adcIcon from '../../assets/positions/bot.png';
import supIcon from '../../assets/positions/sup.svg';

/**
 * PositionIcon - 포지션별 이미지 아이콘을 표시하는 재사용 가능한 컴포넌트
 * @param {string} position - 포지션 이름 ('TOP', 'JNG', 'MID', 'ADC', 'SUP', 'SPECTATOR')
 * @param {string} className - 추가 CSS 클래스 (크기 조절 등)
 * @param {object} style - 추가 인라인 스타일
 */
export default function PositionIcon({ position, className = "", style = {} }) {
  // SPECTATOR position uses Material Icon instead of SVG
  if (position === 'SPECTATOR' || position === 'OBSERVER') {
    return <span className={`material-symbols-outlined ${className}`} style={style}>visibility</span>;
  }

  const getIconSrc = () => {
    switch(position) {
      case 'TOP': return topIcon;
      case 'JNG': 
      case 'JUNGLE': return jngIcon;
      case 'MID': return midIcon;
      case 'ADC': 
      case 'BOT': return adcIcon;
      case 'SUP': return supIcon;
      default: return null;
    }
  };

  const iconSrc = getIconSrc();

  if (!iconSrc) {
    // Fallback for unknown positions or if position is missing
    return <span className={`material-symbols-outlined ${className}`} style={style}>help</span>;
  }

  return (
    <img 
      src={iconSrc} 
      alt={position} 
      className={`object-contain ${className}`} 
      style={style}
    />
  );
}
