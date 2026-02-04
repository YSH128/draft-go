import React, { useEffect, useRef } from 'react';
import useChatStore from '../../stores/useChatStore';
import useAuthStore from '../../stores/useAuthStore';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { Icon } from '../ui';

/**
 * 통합 채팅 컨테이너
 * - Zustand Store와 연동하여 상태 관리
 * - UI 렌더링 담당
 * - 소켓 연결 로직은 아직 포함하지 않음 (Task 분리)
 */
export default function UnifiedChat({ 
  className = "", 
  viewerCount = 0,
  onSendMessage // 상위에서 소켓 전송 핸들러를 주입받음 (Lobby/Draft 마다 다를 수 있음)
}) {
  const { messages, draftId, isConnected } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();
  const myMemberId = user?.memberId || user?.id; // Auth 스토어 구조에 따라 조정 필요
  
  const scrollRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatViewerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Helper: Check if two messages should be grouped
  const shouldGroup = (current, previous) => {
    if (!previous || !current) return false;
    if (current.type !== 'CHAT' || previous.type !== 'CHAT') return false;
    if (current.senderId !== previous.senderId) return false;
    
    // Check if within same minute
    try {
      const currentTime = new Date(current.timestamp);
      const previousTime = new Date(previous.timestamp);
      return (
        currentTime.getMinutes() === previousTime.getMinutes() &&
        currentTime.getHours() === previousTime.getHours() &&
        currentTime.getDate() === previousTime.getDate()
      );
    } catch {
      return false;
    }
  };

  return (
    <aside className={`flex flex-col h-full border-l border-primary/20 bg-chat-dark ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-primary/10 p-3 bg-card-dark/50 shrink-0">
        <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Icon name="chat" className="text-xs" />
          Live Chat
        </h2>

        {/* 시청자 수 (옵션) */}
        {viewerCount > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-1.5 py-px">
            <span className={`size-1 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-gray-500"}`} />
            <span className="text-[9px] font-bold text-primary">
              {formatViewerCount(viewerCount)}
            </span>
          </div>
        )}
      </div>

      {/* 메시지 목록 - Hidden Scrollbar */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-primary/30">
            <Icon name="chat" className="mb-2 text-2xl opacity-20" />
            <span className="text-xs">채팅에 참여해보세요!</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const previousMsg = idx > 0 ? messages[idx - 1] : null;
            const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
            
            const isGroupedWithPrevious = shouldGroup(msg, previousMsg);
            const isGroupedWithNext = shouldGroup(msg, nextMsg);
            
            const isFirstInSequence = !isGroupedWithPrevious;
            const isLastInSequence = !isGroupedWithNext;
            
            return (
              <ChatBubble 
                key={msg.id || idx}
                message={msg} 
                myMemberId={myMemberId}
                isFirstInSequence={isFirstInSequence}
                isLastInSequence={isLastInSequence}
              />
            );
          })
        )}
      </div>

      {/* 입력 영역 - 로그인 여부에 따라 분기 */}
      {user && isAuthenticated ? (
        <ChatInput 
          onSendMessage={onSendMessage} 
          disabled={!isConnected} 
        />
      ) : (
        <div className="border-t border-primary/10 bg-background-dark/80 p-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-white/50">
            <Icon name="lock" className="text-sm" />
            <span>로그인한 사용자만 채팅을 이용할 수 있습니다.</span>
          </div>
        </div>
      )}
    </aside>
  );
}
