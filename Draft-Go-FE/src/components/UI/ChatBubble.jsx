import React from 'react';

const variants = {
  me: "bg-[var(--color-chat-me-bg)] border border-hextech-gold/50 rounded-tr-xl rounded-br-xl rounded-bl-xl text-right",
  other: "bg-panel-dark border border-[var(--color-chat-other-border)] rounded-tl-xl rounded-br-xl rounded-bl-xl text-left",
  system: "bg-transparent text-center border-none italic"
};

export default function ChatBubble({ message, sender, variant = 'other' }) {
  const isMe = variant === 'me';
  
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
       {/* 발신자 이름 (상대방일 경우에만 표시) */}
      {!isMe && variant !== 'system' && (
        <span className="text-[10px] text-[var(--color-text-muted-gold)] font-bold mb-1 ml-1">{sender}</span>
      )}
      
      {/* 메시지 말풍선 */}
      <div className={`px-4 py-2.5 max-w-[85%] ${variants[variant]}`}>
        <p className={`text-xs ${variant === 'system' ? 'text-hextech-gold' : 'text-white'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
