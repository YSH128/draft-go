export default function StatCard({ value, label }) {
  return (
    <div className="group flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-card-dark/90 p-8 shadow-xl backdrop-blur-xl transition-colors hover:border-primary/50">
      <span className="text-4xl font-black tracking-tighter text-primary-bright transition-colors group-hover:text-primary">
        {value}
      </span>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
    </div>
  );
}
