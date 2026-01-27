import { useState } from "react";
import { Icon } from "../../../components/ui";
import ChatMessage from "./ChatMessage";

/**
 * 채팅 사이드바 컴포넌트
 *
 * @param {Array} messages - 채팅 메시지 목록
 * @param {number} viewerCount - 시청자 수
 * @param {Function} onSendMessage - 메시지 전송 핸들러
 */
export default function ChatSidebar({ messages = [], viewerCount = 0, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const formatViewerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <aside className="z-10 flex w-80 shrink-0 flex-col border-l border-primary/20 bg-chat-dark">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-primary/10 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Icon name="chat" className="text-sm" />
          라이브 채팅
        </h2>

        {/* 시청자 수 */}
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase text-primary">
            {formatViewerCount(viewerCount)}
          </span>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-primary/10 bg-background-dark/80 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지 보내기..."
            className="w-full rounded border border-primary/30 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-primary/20 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 text-primary transition-colors hover:text-hextech-gold-bright"
          >
            <Icon name="send" className="text-lg" />
          </button>
        </form>
      </div>
    </aside>
  );
}
