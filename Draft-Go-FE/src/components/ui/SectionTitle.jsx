import React from 'react';

export default function SectionTitle({ children, className = '' }) {
  return (
    <h1 className={`text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-lg ${className}`} 
        style={{ fontFamily: '"Space Grotesk", "Noto Sans KR", sans-serif' }}>
      {children}
    </h1>
  );
}
