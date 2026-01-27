/**
 * 입찰 버튼 컴포넌트
 *
 * @param {number} increment - 입찰 증가 단위
 * @param {number} nextBid - 다음 입찰가
 * @param {Function} onBid - 입찰 핸들러
 * @param {boolean} disabled - 비활성화 여부
 * @param {string} disabledReason - 비활성화 사유 (disabled일 때 표시)
 */
export default function BidButton({
  increment = 20,
  nextBid,
  onBid,
  disabled = false,
  disabledReason = null,
}) {
  return (
    <div className="mt-8 flex w-full max-w-lg flex-col items-center space-y-3">
      <button
        onClick={onBid}
        disabled={disabled}
        className="group relative flex h-18 w-full flex-col items-center justify-center overflow-hidden rounded bg-primary py-4 font-black leading-none text-background-dark shadow-[0_0_25px_rgba(200,155,60,0.3)] ring-4 ring-primary/10 ring-offset-2 ring-offset-background-dark transition-all hover:bg-hextech-gold-bright active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
      >
        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0 group-disabled:translate-y-full" />

        <span className="relative z-10 flex items-center gap-3 text-2xl">
          입찰
          <span className="rounded bg-black/10 px-2 text-xl text-black/80">
            (+{increment} P)
          </span>
        </span>

        <span className="relative z-10 mt-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-black opacity-70">
          다음 입찰가: {nextBid} P
        </span>
      </button>

      {disabled && disabledReason ? (
        <p className="text-center text-[10px] font-medium tracking-wide text-red-400/80">
          {disabledReason}
        </p>
      ) : (
        <p className="text-center text-[10px] font-medium tracking-wide text-primary/50">
          입찰하려면
          <kbd className="mx-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-sans font-bold text-primary/80">
            [B]
          </kbd>
          키를 누르세요
        </p>
      )}
    </div>
  );
}
