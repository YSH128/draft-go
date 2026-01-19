const statusStyles = {
  recruiting: {
    bg: "bg-hextech-blue/10",
    text: "text-hextech-blue",
    border: "border-hextech-blue/30",
    label: "Recruiting",
  },
  "in-progress": {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    label: "In Progress",
  },
  scheduled: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    label: "Scheduled",
  },
  completed: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    label: "Completed",
  },
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.recruiting;

  return (
    <span
      className={`rounded-sm px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${style.bg} ${style.text} border ${style.border}`}
    >
      {style.label}
    </span>
  );
}
