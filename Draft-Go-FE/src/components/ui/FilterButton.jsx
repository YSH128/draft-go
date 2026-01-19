export default function FilterButton({ children, active = false, onClick }) {
  const baseClasses =
    "whitespace-nowrap flex h-10 items-center justify-center gap-2 rounded-sm px-6 text-xs font-bold uppercase tracking-wider transition-all";

  const activeClasses =
    "bg-primary text-background-dark shadow-[0_0_15px_rgba(200,155,60,0.3)] font-black";

  const inactiveClasses =
    "bg-card-dark border border-primary/20 text-slate-300 hover:border-primary/60 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
}

export function FilterButtonGroup({ children }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 md:pb-0">
      {children}
    </div>
  );
}
