import { CHAT_MESSAGE_TYPES } from "../../../constants/socket";

/**
 * 채팅 메시지 컴포넌트
 *
 * @param {Object} message - 메시지 정보
 * @param {string} message.type - 메시지 타입 (CHAT, JOIN, LEAVE, SYSTEM)
 * @param {number} message.senderId - 발신자 ID
 * @param {string} message.senderNickname - 발신자 닉네임
 * @param {string} message.content - 메시지 내용
 * @param {string} message.timestamp - 전송 시간 (ISO 8601)
 * @param {number} myMemberId - 현재 로그인 사용자 ID
 */
export default function ChatMessage({ message, myMemberId }) {
  const { type, senderId, senderNickname, content, timestamp } = message;

  // 시간 포맷팅 (예: "오후 2:30")
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

  // JOIN, LEAVE, SYSTEM 메시지 (시스템 스타일)
  if (type === CHAT_MESSAGE_TYPES.JOIN) {
    return (
      <div className="py-1 text-center">
        <span className="text-[10px] text-primary/60">
          {senderNickname || "알 수 없음"}님이 입장했습니다.
        </span>
      </div>
    );
  }

  if (type === CHAT_MESSAGE_TYPES.LEAVE) {
    return (
      <div className="py-1 text-center">
        <span className="text-[10px] text-primary/60">
          {senderNickname || "알 수 없음"}님이 퇴장했습니다.
        </span>
      </div>
    );
  }

  if (type === CHAT_MESSAGE_TYPES.SYSTEM) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">
          시스템
        </span>
        <p className="border-l-2 border-primary/30 pl-2 text-xs italic text-primary/80">
          {content}
        </p>
      </div>
    );
  }

  // CHAT 메시지 (일반 채팅)
  const isMe = myMemberId && senderId && String(myMemberId) === String(senderId);
  const displayName = senderNickname || "익명";
  const timeStr = formatTime(timestamp);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${isMe ? "text-primary" : "text-blue-400"}`}>
          {isMe ? "나" : displayName}
        </span>
        {timeStr && (
          <span className="text-[10px] text-white/40">{timeStr}</span>
        )}
      </div>
      <p className={`text-xs ${isMe ? "text-primary-bright" : "text-white/80"}`}>
        {content}
      </p>
    </div>
  );
}
