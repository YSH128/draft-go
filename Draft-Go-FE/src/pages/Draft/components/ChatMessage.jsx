/**
 * 채팅 메시지 컴포넌트
 *
 * @param {Object} message - 메시지 정보
 * @param {string} message.type - 메시지 타입 (system, user)
 * @param {string} message.sender - 발신자 이름
 * @param {string} message.content - 메시지 내용
 * @param {string} message.color - 발신자 색상 (team color 등)
 */
export default function ChatMessage({ message }) {
  const { type, sender, content, color } = message;

  // 시스템 메시지
  if (type === "system") {
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

  // 일반 사용자 메시지
  const colorClasses = {
    blue: "text-blue-400",
    gold: "text-primary",
    red: "text-red-400",
    green: "text-green-400",
    purple: "text-purple-400",
    default: "text-gray-500",
  };

  const senderColor = colorClasses[color] || colorClasses.default;
  const isHighlighted = color === "gold"; // 골드 색상은 하이라이트

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className={`text-xs font-bold ${senderColor}`}>{sender}</span>
      </div>
      <p className={`text-xs ${isHighlighted ? "text-primary-bright" : "text-white/80"}`}>
        {content}
      </p>
    </div>
  );
}
