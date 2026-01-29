/**
 * Skeleton UI Component
 * 데이터 로딩 중 표시되는 플레이스홀더 컴포넌트
 * Hextech 테마에 맞춘 골드/다크 색상 사용
 */

export default function Skeleton({ className = '', variant = 'default' }) {
  const baseClasses = 'animate-pulse rounded';

  const variantClasses = {
    default: 'bg-white/5',
    text: 'bg-white/5 h-4',
    circle: 'bg-white/5 rounded-full',
    card: 'bg-white/5',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

/**
 * 토너먼트 카드 스켈레톤
 * TournamentCard의 레이아웃을 그대로 유지한 로딩 상태
 */
export function TournamentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-[#1e2328]">
      {/* 이미지 영역 */}
      <div className="relative aspect-[16/9]">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* 상태 뱃지 스켈레톤 */}
        <div className="absolute left-4 top-4">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="relative p-6">
        {/* 아이콘 뱃지 */}
        <div className="absolute left-6 top-0 z-10 -translate-y-1/2">
          <Skeleton variant="circle" className="size-10" />
        </div>

        {/* 제목 스켈레톤 */}
        <Skeleton className="mt-2 h-6 w-3/4" />

        {/* 호스트 정보 스켈레톤 */}
        <div className="mt-4 flex items-center gap-3">
          <Skeleton variant="circle" className="size-6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* 하단 정보 & 버튼 스켈레톤 */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-9 w-24 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * 토너먼트 카드 그리드용 스켈레톤 (4개)
 */
export function TournamentGridSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TournamentCardSkeleton key={index} />
      ))}
    </>
  );
}
