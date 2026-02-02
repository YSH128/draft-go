import React, { useState } from 'react';

export default function ChatInput({ placeholder = "메시지를 입력하세요...", onSubmit, className = '' }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && onSubmit) {
      onSubmit(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const handleButtonClick = () => {
    handleSend();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-card-bg border border-hextech-gold/30 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-hextech-gold/40 outline-none focus:border-hextech-gold focus:ring-1 focus:ring-hextech-gold/50 transition-all font-display"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-hextech-gold hover:text-primary p-1 transition-colors group"
        onClick={handleButtonClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 transition-transform group-hover:scale-110">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </div>
  );
}
