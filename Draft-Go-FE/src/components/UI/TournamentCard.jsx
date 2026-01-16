import React from 'react';

// 페이지 1: 대회 카드 (호버 효과)
const cardStyle = "bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group cursor-pointer";

export default function TournamentCard({ children, className = '', ...props }) {
  return (
    <div className={`${cardStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}
