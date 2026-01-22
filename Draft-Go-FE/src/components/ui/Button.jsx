import React from 'react';

const variants = {
  // 페이지 1: 로그인 / 생성 버튼
  primary: "bg-primary text-background-dark shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-primary/10",
  // 페이지 1: 공통 액션 버튼 (초대 코드, 확인, 설정 완료) - 경매 시작하기 버튼 효과 통일
  primaryStatic: "bg-hextech-gold text-background-dark shadow-[0_0_15px_rgba(200,155,60,0.3)] hover:shadow-[0_0_25px_rgba(200,155,60,0.5)] hover:brightness-110 active:scale-[0.98] hover:bg-primary",
  
  // 페이지 1: 참가 코드 버튼
  outline: "bg-transparent text-primary border-2 border-primary/50 hover:border-primary hover:bg-primary/5",
  
  // 페이지 3: 대형 입찰 버튼
  bid: "bg-hextech-gold hover:bg-primary text-background-dark font-black text-2xl shadow-[0_0_20px_rgba(200,155,60,0.3)] active:scale-[0.98] flex-col h-16 leading-none",
  
  // 텍스트 전용
  ghost: "text-slate-400 hover:text-white bg-transparent shadow-none"
};

const sizes = {
  sm: "px-4 py-1.5 text-xs font-bold",
  md: "px-6 py-2.5 text-sm font-black tracking-tighter rounded", // 기본 로그인 크기
  lg: "px-10 py-4 text-xl font-black rounded-xl",               // 히어로 버튼
  full: "w-full py-4 rounded"                                   // 전체 너비
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  // 모든 버튼에 공통으로 적용되는 기본 트랜지션
  const baseStyle = "flex items-center justify-center gap-2 transition-all duration-200 uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${size !== 'full' ? sizes[size] : ''} ${size === 'full' ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
