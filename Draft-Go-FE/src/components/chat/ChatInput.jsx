import React, { useState } from 'react';
import { Icon } from '../ui';

/**
 * 채팅 입력 컴포넌트
 */
export default function ChatInput({ onSendMessage, disabled = false }) {
  const [inputValue, setInputValue] = useState("");

  const sendMessage = () => {
    if (disabled) return;
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    // 한글 입력 중 Enter 키 중복 방지 (isComposing check)
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-primary/10 bg-background-dark/80 p-3 flex-shrink-0">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "연결 중..." : "메시지 보내기..."}
          className="w-full rounded border border-primary/30 bg-white/5 px-3 py-2 text-xs text-white placeholder-primary/20 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="absolute right-2 top-1.5 text-primary transition-colors hover:text-hextech-gold-bright disabled:text-gray-600"
        >
          <Icon name="send" className="text-sm" />
        </button>
      </form>
    </div>
  );
}
