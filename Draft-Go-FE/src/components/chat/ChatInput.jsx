import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui';

/**
 * 채팅 입력 컴포넌트
 */
export default function ChatInput({ onSendMessage, disabled = false }) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  // 텍스트 내용에 따라 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 높이 초기화
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`; // 내용에 맞춰 늘리되 최대 100px 제한
    }
  }, [inputValue]);

  const sendMessage = () => {
    if (disabled) return;
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    // 한글 입력 중 Enter 키 중복 방지
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-primary/10 bg-background-dark/80 p-3 flex-shrink-0">
      <div className="relative flex items-center gap-2 rounded border border-primary/30 bg-white/5 px-3 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          maxLength={100}
          placeholder={disabled ? "연결 중..." : "메시지 보내기..."}
          className="w-full resize-none bg-transparent text-xs text-white placeholder-primary/20 outline-none disabled:opacity-50 no-scrollbar p-0 leading-5 pr-8"
          style={{ 
            minHeight: '20px', 
            maxHeight: '100px',
          }}
        />
        
        {/* 글자수 카운터 */}
        <span className="absolute bottom-1 right-10 text-[10px] text-gray-500 select-none">
          {inputValue.length}/100
        </span>

        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || disabled}
          className="flex-shrink-0 h-[20px] flex items-center justify-center text-primary transition-colors hover:text-hextech-gold-bright disabled:text-gray-600"
        >
          <Icon name="send" className="text-sm" />
        </button>
      </div>
    </div>
  );
}
