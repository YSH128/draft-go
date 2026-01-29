import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Icon,
  FilterButton,
  FilterButtonGroup,
  TournamentCard,
  TournamentGridSkeleton,
  GoldButton,
} from "../../../components/ui";
import FadeInUp from "../../../components/ui/FadeInUp";
import { fetchDrafts } from "../../../api/draft";
import { filterDraftsByStatus } from "../../../api/draftAdapter";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;

const filters = [
  { id: "all", label: "전체 보기" },
  { id: "recruiting", label: "모집중" },
  { id: "in-progress", label: "진행중" },
  { id: "my", label: "나의 참여", disabled: true },
];

// 상태별 아이콘 매핑
const statusIconMap = {
  recruiting: "sports_esports",
  "in-progress": "trophy",
  scheduled: "calendar_today",
  completed: "check_circle",
};

export default function TournamentSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // React Query로 드래프트 목록 조회
  const {
    data: drafts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["drafts"],
    queryFn: fetchDrafts,
    staleTime: 60000, // 1분간 캐시 유지
    refetchOnWindowFocus: false,
  });

  // 필터 변경 시 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeFilter]);

  // 클라이언트 사이드 필터링
  const filteredDrafts = filterDraftsByStatus(drafts, activeFilter);

  // 현재 보여줄 카드 목록
  const visibleDrafts = filteredDrafts.slice(0, visibleCount);
  const hasMoreDrafts = filteredDrafts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  // TODO: 실제 네비게이션/모달 로직으로 교체 필요
  const handleJoin = () => {};
  const handleSpectate = () => {};
  const handleNotify = () => {};

  return (
    <section className="mt-16 px-4 sm:mt-24 sm:px-6 md:mt-32">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-primary/20 pb-6 sm:mb-10 sm:gap-6 sm:pb-8 md:flex-row md:items-end">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="flex items-center gap-3 text-2xl font-black text-white sm:gap-4 sm:text-4xl">
            <Icon name="stadium" className="text-2xl text-[var(--color-primary)] sm:text-4xl" />
            <span className="drop-shadow-md">진행 중인 대회</span>
          </h2>
          <p className="text-sm text-gray-400 sm:text-lg">
            지금 바로 참여 가능한 전략 경매 방을 확인하세요.
          </p>
        </div>
        <FilterButtonGroup>
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => !filter.disabled && setActiveFilter(filter.id)}
              disabled={filter.disabled}
              className={filter.disabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterButtonGroup>
      </div>

      {/* 카드 그리드 */}
      <div className="relative">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {/* 로딩 상태 */}
          {isLoading && <TournamentGridSkeleton count={4} />}

          {/* 에러 상태 */}
          {isError && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex size-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <Icon name="error" className="text-3xl text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">데이터를 불러올 수 없습니다</p>
                <p className="mt-1 text-sm text-gray-400">
                  {error?.message || "네트워크 오류가 발생했습니다"}
                </p>
              </div>
              <GoldButton
                variant="outline"
                size="sm"
                icon="refresh"
                onClick={() => refetch()}
                className="mt-2"
              >
                재시도
              </GoldButton>
            </div>
          )}

          {/* 데이터 없음 상태 */}
          {!isLoading && !isError && filteredDrafts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Icon name="inbox" className="text-3xl text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {activeFilter === "all" ? "진행 중인 대회가 없습니다" : "해당하는 대회가 없습니다"}
                </p>
                <p className="mt-1 text-sm text-gray-400">새로운 대회가 열리면 이곳에 표시됩니다</p>
              </div>
            </div>
          )}

          {/* 드래프트 카드 목록 */}
          {!isLoading &&
            !isError &&
            visibleDrafts.map((draft, index) => (
              <FadeInUp key={draft.id} delay={index < INITIAL_VISIBLE_COUNT ? index * 100 : 50}>
                <TournamentCard
                  title={draft.title}
                  host={draft.ownerName}
                  imageUrl={draft.thumbnailUrl}
                  status={draft.status}
                  icon={statusIconMap[draft.status] || "sports_esports"}
                  current={draft.currentParticipants}
                  total={draft.maxParticipants}
                  startsIn={draft.startTimeRelative}
                  liveText={draft.status === "in-progress" ? "Live" : undefined}
                  onJoin={() => handleJoin(draft.id)}
                  onSpectate={() => handleSpectate(draft.id)}
                  onNotify={() => handleNotify(draft.id)}
                />
              </FadeInUp>
            ))}
        </div>

        {/* 더 보기 버튼 영역 */}
        {!isLoading && !isError && hasMoreDrafts && (
          <div className="relative mt-4">
            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-[#010A13] to-transparent" />

            {/* Load More Button */}
            <div className="flex justify-center pb-6 pt-4">
              <GoldButton
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
              >
                더 보기
              </GoldButton>
            </div>
          </div>
        )}

        {/* 모두 표시됨 */}
        {!isLoading && !isError && filteredDrafts.length > 0 && !hasMoreDrafts && visibleCount > INITIAL_VISIBLE_COUNT && (
          <div className="mt-12 flex justify-center pb-8">
            <span className="text-sm text-gray-500">모든 대회를 표시했습니다</span>
          </div>
        )}
      </div>
    </section>
  );
}
