import React from 'react';

const styles = {
  // 티어 배지
  default: "bg-hextech-gold/10 border border-hextech-gold/30 text-hextech-gold",
  
  // 티어 배지
  iron: "bg-[var(--color-tier-iron-bg)] text-[var(--color-tier-iron-badge-text)] shadow-sm border-none",
  bronze: "bg-[var(--color-tier-bronze-bg)] text-[var(--color-tier-bronze-badge-text)] shadow-sm border-none",
  silver: "bg-[var(--color-tier-silver-bg)] text-[var(--color-tier-silver-badge-text)] shadow-sm border-none",
  gold: "bg-[var(--color-tier-gold-bg)] text-[var(--color-tier-gold-badge-text)] shadow-sm border-none",
  platinum: "bg-[var(--color-tier-platinum-bg)] text-[var(--color-tier-platinum-badge-text)] shadow-sm border-none",
  emerald: "bg-[var(--color-tier-emerald-bg)] text-[var(--color-tier-emerald-badge-text)] shadow-sm border-none",
  diamond: "bg-[var(--color-tier-diamond-bg)] text-[var(--color-tier-diamond-badge-text)] shadow-sm border-none",
  master: "bg-[var(--color-tier-master-bg)] text-[var(--color-tier-master-badge-text)] shadow-sm border-none",
  grandmaster: "bg-[var(--color-tier-grandmaster-bg)] text-[var(--color-tier-grandmaster-badge-text)] shadow-sm border-none",
  challenger: "bg-[var(--color-tier-challenger-bg)] text-[var(--color-tier-challenger-badge-text)] shadow-[0_0_10px_rgba(244,192,37,0.4)] border-none",
  
  // 상태 태그
  recruiting: "bg-hextech-blue/20 text-hextech-blue border border-hextech-blue/40 backdrop-blur-md", // 모집중
  ongoing: "bg-primary/20 text-primary border border-primary/40 backdrop-blur-md", // 진행중
  
  // 입찰 태그
  bid: "bg-hextech-gold text-background-dark font-black tracking-widest shadow-[0_0_10px_rgba(200,155,60,0.4)]"
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] md:text-xs font-bold uppercase ${styles[variant]} ${className} flex items-center justify-center gap-1`}>
      {children}
    </span>
  );
}
