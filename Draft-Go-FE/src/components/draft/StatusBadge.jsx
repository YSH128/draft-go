import Icon from "../ui/Icon";

const statusStyles = {
  recruiting: {
    bg: "bg-slate-900/80",
    text: "text-cyan-400",
    border: "border-cyan-400/50",
    label: "모집중",
    dot: "bg-cyan-400",
  },
  "in-progress": {
    bg: "bg-slate-900/80",
    text: "text-amber-400",
    border: "border-amber-400/50",
    label: "진행중",
    dot: "bg-amber-400 animate-pulse",
  },
  scheduled: {
    bg: "bg-slate-900/80",
    text: "text-violet-400",
    border: "border-violet-400/50",
    label: "예정",
    dot: "bg-violet-400",
  },
  completed: {
    bg: "bg-slate-900/80",
    text: "text-slate-400",
    border: "border-slate-500/50",
    label: "종료",
    dot: "bg-slate-400",
  },
  participating: {
    bg: "bg-slate-900/80",
    text: "text-emerald-400",
    border: "border-emerald-400/50",
    label: "참여중",
  },
};

export default function StatusBadge({ status, variant, label, icon, showDot = true, className = "" }) {
  // status가 있으면 해당 스타일셋 사용, 없으면 variant로 찾기 (기본값: recruiting)
  const styleKey = status || variant || "recruiting";
  const style = statusStyles[styleKey] || statusStyles.recruiting;

  // props로 덮어쓰기 가능
  const displayLabel = label || style.label;
  const displayIcon = icon || style.iconName;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md transition-colors ${style.bg} ${style.text} border ${style.border} ${className}`}
    >
      {/* 아이콘이 있으면 아이콘, 없으면(그리고 showDot이면) 점 표시 */}
      {displayIcon ? (
        <Icon name={displayIcon} className="text-xs" />
      ) : (
        showDot && style.dot && <span className={`size-1.5 rounded-full ${style.dot}`} />
      )}
      {displayLabel}
    </span>
  );
}
