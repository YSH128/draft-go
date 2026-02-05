import { useState, useEffect, useMemo } from "react";
import {
  Icon,
  FilterButton,
  FilterButtonGroup,

  TournamentGridSkeleton,
  GoldButton,
} from "../../../components/ui";
import TournamentCard from "../../../components/draft/TournamentCard";
import FadeInUp from "../../../components/ui/FadeInUp";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;

/**
 * TournamentSection 컴포넌트
 * @param {Object} props
 * @param {Array} props.drafts - 드래프트 목록 (서버에서 필터링된 결과)
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {boolean} props.isError - 에러 상태
 * @param {Error} props.error - 에러 객체
 * @param {Function} props.refetch - 데이터 재조회 함수
 * @param {Function} props.onCardAction - 카드 클릭 핸들러
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {string} props.activeFilter - 현재 선택된 필터
 * @param {Function} props.onFilterChange - 필터 변경 핸들러
 */
export default function TournamentSection({
  drafts = [],
  isLoading = false,
  isError = false,
  error = null,
  refetch = () => {},
  onCardAction = () => {},
  isLoggedIn = false,
  activeFilter = "all",
  onFilterChange = () => {},
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // 필터 옵션 (로그인 시에만 "나의 참여" 표시)
  const filters = useMemo(() => {
    const baseFilters = [
      { id: "all", label: "전체 보기" },
      { id: "recruiting", label: "모집중" },
      { id: "in-progress", label: "진행중" },
    ];
    if (isLoggedIn) {
      baseFilters.push({ id: "my", label: "나의 참여" });
    }
    return baseFilters;
  }, [isLoggedIn]);

  // 필터 변경 시 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeFilter]);

  // 현재 보여줄 카드 목록 (서버에서 이미 필터링됨)
  const visibleDrafts = drafts.slice(0, visibleCount);
  const hasMoreDrafts = drafts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  // 빈 상태 메시지
  const getEmptyMessage = () => {
    if (activeFilter === "all") return "진행 중인 대회가 없습니다";
    if (activeFilter === "my") return "참여 중인 대회가 없습니다";
    return "해당하는 대회가 없습니다";
  };

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
              onClick={() => onFilterChange(filter.id)}
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
          {!isLoading && !isError && drafts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Icon name="inbox" className="text-3xl text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{getEmptyMessage()}</p>
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
                  hostProfileImage={draft.ownerProfileImage}
                  imageUrl={draft.thumbnailUrl}
                  status={draft.status}
                  current={draft.currentParticipants}
                  total={draft.maxParticipants}
                  startsIn={draft.startTimeRelative}
                  isParticipating={draft.isParticipating}
                  onJoin={() => onCardAction(draft)}
                  onSpectate={() => onCardAction(draft)}
                  onNotify={() => onCardAction(draft)}
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
        {!isLoading && !isError && drafts.length > 0 && !hasMoreDrafts && visibleCount > INITIAL_VISIBLE_COUNT && (
          <div className="mt-12 flex justify-center pb-8">
            <span className="text-sm text-gray-500">모든 대회를 표시했습니다</span>
          </div>
        )}
      </div>
    </section>
  );
}
