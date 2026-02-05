/**
 * 원형 타이머 컴포넌트
 * - SVG 기반 원형 프로그레스 바
 *
 * @param {number} seconds - 남은 초 (소수점 포함)
 * @param {number} maxSeconds - 전체 초 (기본 15)
 */
export default function TimerCircle({ seconds, maxSeconds = 15 }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / maxSeconds) * circumference;
  const offset = circumference - progress;

  // 0.01초 단위로 표시 (소수점 두 자리)
  const displaySeconds = Math.max(0, seconds).toFixed(2);

  return (
    <div className="relative flex size-28 items-center justify-center">
      <svg className="absolute inset-0 size-full -rotate-90">
        {/* 배경 원 */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#1e2328"
          strokeWidth="5"
        />
        {/* 프로그레스 원 */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#c89b3c"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-100"
        />
      </svg>
      {/* 초 표시 (소수점 두 자리) */}
      <span className="text-2xl font-black text-primary tabular-nums">{displaySeconds}</span>
    </div>
  );
}
