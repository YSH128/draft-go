import Icon from "./Icon";
import StatusBadge from "./StatusBadge";

const iconMap = {
  esports: "sports_esports",
  trophy: "trophy",
  swords: "swords",
  calendar: "calendar_today",
};

export default function TournamentCard({
  title,
  host,
  imageUrl,
  status = "recruiting",
  icon = "esports",
  current,
  total,
  liveText,
  startsIn,
  onJoin,
  onSpectate,
  onNotify,
}) {
  const isRecruiting = status === "recruiting";
  const isInProgress = status === "in-progress";
  const isScheduled = status === "scheduled";

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-[#1e2328] transition-all hover:-translate-y-2 hover:border-[#c89b3c] hover:shadow-[0_0_25px_rgba(200,155,60,0.15)]">
      {/* 호버시 외부 링크 아이콘 */}
      <div className="absolute right-0 top-0 z-20 p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Icon name="open_in_new" className="text-primary" />
      </div>

      {/* 이미지 영역 */}
      <div
        className="relative aspect-[16/9] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-background-dark/20 transition-colors group-hover:bg-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge status={status} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent opacity-90" />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="relative p-6">
        {/* 아이콘 뱃지 */}
        <div className="absolute left-6 top-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-background-dark">
          <Icon name={iconMap[icon] || iconMap.esports} className="text-xl text-primary" />
        </div>

        {/* 제목 */}
        <h3 className="mt-2 truncate text-xl font-black leading-tight text-white transition-colors group-hover:text-primary">
          {title}
        </h3>

        {/* 호스트 정보 */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-6 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
            <Icon name="person" className="text-sm text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Host</span>
            <span className="text-xs font-bold text-slate-200">{host}</span>
          </div>
        </div>

        {/* 하단 정보 & 버튼 */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex flex-col">
            {isRecruiting && (
              <>
                <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-500">
                  Entry
                </span>
                <span className="text-lg font-black tracking-tighter text-white">
                  {current} <span className="text-sm font-medium text-slate-500">/ {total}</span>
                </span>
              </>
            )}
            {isInProgress && (
              <>
                <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-500">
                  Status
                </span>
                <span className="text-lg font-black tracking-tighter text-hextech-blue">
                  {liveText || "Live"}
                </span>
              </>
            )}
            {isScheduled && (
              <>
                <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-500">
                  Starts In
                </span>
                <span className="text-lg font-black tracking-tighter text-white">{startsIn}</span>
              </>
            )}
          </div>

          {isRecruiting && (
            <CardButton variant="primary" onClick={onJoin}>
              Join Now
            </CardButton>
          )}
          {isInProgress && (
            <CardButton variant="secondary" onClick={onSpectate}>
              Spectate
            </CardButton>
          )}
          {isScheduled && (
            <CardButton variant="secondary" onClick={onNotify}>
              Notify
            </CardButton>
          )}
        </div>
      </div>
    </div>
  );
}

function CardButton({ children, variant = "primary", onClick }) {
  const baseClasses =
    "flex h-9 items-center justify-center rounded-sm px-4 text-xs font-bold uppercase tracking-wider transition-all";

  const variantClasses = {
    primary:
      "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background-dark",
    secondary:
      "bg-background-dark text-slate-400 border border-white/10 hover:text-white hover:border-white/30",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}

// 간단한 카드 래퍼 (기존 호환성)
export function TournamentCardWrapper({ children, className = "", ...props }) {
  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-lg border border-primary/20 bg-card-dark transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(200,155,60,0.15)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
