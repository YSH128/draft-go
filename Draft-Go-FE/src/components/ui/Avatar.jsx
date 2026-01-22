import React from 'react';


const sizes = {
  sm: "size-8",      // 채팅 / 리스트 (32px)
  md: "size-12",     // 기본 (48px)
  lg: "size-24",     // 팀장 카드 (96px)
  xl: "size-32"      // 드래프트 활성 (128px)
};

export default function Avatar({ src, alt, size = "md", tier = "default", className = '' }) {
  const baseStyle = "rounded-full bg-cover bg-center shrink-0 bg-card-bg relative";
  const tierLower = tier.split(' ')[0].toLowerCase();
  
  // 기본 스타일 (테두리 없음/기본)
  let borderStyle = {};
  
  if (tierLower !== 'default') {
      const colorVar = `var(--color-tier-${tierLower}-bg)`;
      // 챌린저/그마/마스터 등 상위 티어는 글로우 효과 추가
      const isHighTier = ['challenger', 'grandmaster', 'master'].includes(tierLower);
      
      // 챌린저는 아바타 테두리를 일렉트릭 블루로 (노란 배경과 대비)
      const borderColor = tierLower === 'challenger' ? '#1597E5' : colorVar;
      
      borderStyle = {
          border: `2px solid ${borderColor}`,
          boxShadow: isHighTier ? `0 0 10px ${borderColor}` : 'none'
      };
  } else {
      borderStyle = { border: '1px solid rgba(255,255,255,0.1)' };
  }
  
  return (
    <div 
      className={`${baseStyle} ${sizes[size]} ${className}`}
      style={{ 
          backgroundImage: src ? `url('${src}')` : undefined,
          ...borderStyle
      }}
      title={alt}
    >
      {!src && <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">?</span>}
    </div>
  );
}
