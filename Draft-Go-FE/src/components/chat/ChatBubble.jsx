import React from 'react';

// Socket Constants (상수 파일 위치는 프로젝트 구조에 맞게 조정 필요)
// 보통 constants/socket.js 에 있을 것으로 추정
export const CHAT_MESSAGE_TYPES = {
  CHAT: 'CHAT',
  JOIN: 'JOIN',
  LEAVE: 'LEAVE',
  SYSTEM: 'SYSTEM',
};

/**
 * 개별 채팅 메시지 컴포넌트
 * 다크 테마 적용
 */
export default function ChatBubble({ 
  message, 
  myMemberId, 
  isFirstInSequence = true,
  isLastInSequence = true 
}) {
  const { type, senderId, senderNickname, senderProfileImageUrl, content, timestamp } = message;

  // 시간 포맷팅
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  // 이름 포맷팅 (SummonerName#Tag -> SummonerName)
  const formatName = (name) => {
    if (!name) return "익명";
    return name.split('#')[0];
  };

  // 1. 입장 (JOIN) - 중앙 정렬 배지
  if (type === CHAT_MESSAGE_TYPES.JOIN) {
    return (
      <div className="flex justify-center py-2 animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="text-[10px] text-green-400 font-medium">
            {formatName(senderNickname)}님이 입장했습니다.
          </span>
        </div>
      </div>
    );
  }

  // 2. 퇴장 (LEAVE) - 중앙 정렬 배지
  if (type === CHAT_MESSAGE_TYPES.LEAVE) {
    return (
      <div className="flex justify-center py-2 animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="text-[10px] text-red-400 font-medium">
            {formatName(senderNickname)}님이 퇴장했습니다.
          </span>
        </div>
      </div>
    );
  }

  // 3. 시스템 (SYSTEM) - 중앙 정렬 배지
  if (type === CHAT_MESSAGE_TYPES.SYSTEM) {
    return (
      <div className="flex justify-center py-1.5 animate-fade-in">
        <span className="text-[11px] text-gray-500 font-medium">
          {content}
        </span>
      </div>
    );
  }

  // 4. 일반 채팅 (CHAT) - 간결한 스타일
  const isMe = myMemberId && senderId && String(myMemberId) === String(senderId);
  const displayName = formatName(senderNickname);
  const timeStr = formatTime(timestamp);

  return (
    <div 
      className={`flex w-full ${isFirstInSequence ? 'mt-3' : 'mt-1.5'} ${isMe ? "justify-end" : "justify-start"}`}
    >
      {/* 메시지 내용 */}
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {/* 이름 - 첫 메시지에만 표시, 내 메시지는 표시 안함 */}
        {!isMe && isFirstInSequence && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-xs font-bold text-blue-400">
              {displayName}
            </span>
          </div>
        )}
        
        {/* 메시지 버블 */}
        <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <div 
            className={`w-fit max-w-[250px] break-words rounded px-2.5 py-1.5 text-xs shadow-sm ${
              isMe 
                ? "bg-primary/20 text-white rounded-tr-none border border-primary/20" 
                : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
            }`}
          >
            {content}
          </div>
          
          {isLastInSequence && timeStr && (
            <span className="text-[9px] text-white/30 mb-0.5 shrink-0">{timeStr}</span>
          )}
        </div>
      </div>
    </div>
  );
}
