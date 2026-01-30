const statusStyles = {
  recruiting: {
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-400/40",
    label: "모집중",
    dot: "bg-cyan-400",
  },
  "in-progress": {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-400/40",
    label: "진행중",
    dot: "bg-amber-400 animate-pulse",
  },
  scheduled: {
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    border: "border-violet-400/40",
    label: "예정",
    dot: "bg-violet-400",
  },
  completed: {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    border: "border-slate-500/40",
    label: "종료",
    dot: "bg-slate-400",
  },
};

export default function StatusBadge({ status, showDot = true }) {
  const style = statusStyles[status] || statusStyles.recruiting;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md ${style.bg} ${style.text} border ${style.border}`}
    >
      {showDot && <span className={`size-1.5 rounded-full ${style.dot}`} />}
      {style.label}
    </span>
  );
}
