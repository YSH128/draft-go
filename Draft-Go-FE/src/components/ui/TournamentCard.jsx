import { useState } from "react";
import Icon from "./Icon";
import StatusBadge from "./StatusBadge";

// 기본 썸네일 이미지 (이미지 로드 실패 시 폴백)
const DEFAULT_THUMBNAIL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg";

// 상태별 버튼 설정
const buttonConfig = {
  recruiting: {
    label: "참가하기",
    variant: "primary",
    handler: "onJoin",
  },
  "in-progress": {
    label: "관전하기",
    variant: "secondary",
    handler: "onSpectate",
  },
  scheduled: {
    label: "알림받기",
    variant: "secondary",
    handler: "onNotify",
  },
  completed: {
    label: "결과보기",
    variant: "ghost",
    handler: "onJoin",
  },
};

export default function TournamentCard({
  title,
  host,
  hostProfileImage,
  imageUrl,
  status = "recruiting",
  current,
  total,
  startsIn,
  isParticipating = false,
  onJoin,
  onSpectate,
  onNotify,
}) {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isRecruiting = status === "recruiting";
  const isInProgress = status === "in-progress";
  const isScheduled = status === "scheduled";
  const isFull = isRecruiting && current >= total;

  // 썸네일 URL 결정 (에러 시 폴백)
  const thumbnailUrl = imgError || !imageUrl ? DEFAULT_THUMBNAIL : imageUrl;

  // 버튼 설정 가져오기
  const btnConfig = buttonConfig[status] || buttonConfig.recruiting;
  const handlers = { onJoin, onSpectate, onNotify };

  // 참여 중인 경우 버튼 텍스트 변경
  const getButtonLabel = () => {
    if (isParticipating) return "입장하기";
    if (isFull) return "모집완료";
    return btnConfig.label;
  };

  const getButtonVariant = () => {
    if (isParticipating) return "primary";
    if (isFull) return "disabled";
    return btnConfig.variant;
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#1a1f25] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(200,155,60,0.12)]">
      {/* 썸네일 영역 */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f25] via-transparent to-transparent" />

        {/* 상태 뱃지 */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={status} />
        </div>

        {/* 참여 중 표시 */}
        {isParticipating && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
              <Icon name="check_circle" className="text-xs" />
              참여중
            </span>
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex flex-1 flex-col p-4">
        {/* 제목 */}
        <h3 className="truncate text-base font-bold text-white transition-colors group-hover:text-primary">
          {title}
        </h3>

        {/* 방장 정보 */}
        <div className="mt-2 flex items-center gap-2">
          {/* 아바타 */}
          <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-slate-700">
            {!avatarError && hostProfileImage ? (
              <img
                src={hostProfileImage}
                alt={host}
                className="size-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Icon name="person" className="text-xs text-slate-400" />
            )}
          </div>
          <span className="truncate text-xs text-slate-400">{host}</span>
        </div>

        {/* 하단 정보 & 버튼 */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/5 pt-3">
          {/* 상태별 정보 표시 */}
          <div className="flex flex-col">
            {isRecruiting && (
              <div className="flex items-center gap-1.5">
                <Icon name="groups" className="text-base text-slate-500" />
                <span className="text-sm font-bold text-white">{total}팀</span>
              </div>
            )}
            {isInProgress && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                </span>
                <span className="text-sm font-bold text-red-400">LIVE</span>
              </div>
            )}
            {isScheduled && startsIn && (
              <div className="flex items-center gap-1.5">
                <Icon name="schedule" className="text-base text-slate-500" />
                <span className="text-sm font-medium text-slate-300">{startsIn}</span>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <CardButton
            variant={getButtonVariant()}
            onClick={handlers[btnConfig.handler]}
            disabled={isFull && !isParticipating}
          >
            {getButtonLabel()}
          </CardButton>
        </div>
      </div>
    </div>
  );
}

function CardButton({ children, variant = "primary", onClick, disabled = false }) {
  const baseClasses =
    "flex h-8 items-center justify-center rounded-md px-3 text-xs font-bold transition-all";

  const variantClasses = {
    primary:
      "bg-primary/15 text-primary border border-primary/30 hover:bg-primary hover:text-background-dark active:scale-95",
    secondary:
      "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600 hover:text-white active:scale-95",
    ghost:
      "bg-transparent text-slate-400 border border-transparent hover:text-white hover:bg-white/5",
    disabled:
      "bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed",
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
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
