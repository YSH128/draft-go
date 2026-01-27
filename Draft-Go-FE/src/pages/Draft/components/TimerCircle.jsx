/**
 * 원형 타이머 컴포넌트
 * - SVG 기반 원형 프로그레스 바
 *
 * @param {number} seconds - 남은 초
 * @param {number} maxSeconds - 전체 초 (기본 30)
 */
export default function TimerCircle({ seconds, maxSeconds = 30 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / maxSeconds) * circumference;
  const offset = circumference - progress;

  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg className="absolute inset-0 size-full -rotate-90">
        {/* 배경 원 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="#1e2328"
          strokeWidth="4"
        />
        {/* 프로그레스 원 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="#c89b3c"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      {/* 초 표시 */}
      <span className="animate-pulse text-2xl font-black text-primary">{seconds}</span>
    </div>
  );
}
