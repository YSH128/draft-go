import { HeroSection, TournamentSection, CTASection } from "./sections";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import JoinWithCodeModal from "../../components/ui/JoinWithCodeModal";
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import AlertModal from "../../components/ui/AlertModal";
import useAuthStore from "../../stores/useAuthStore";
import FadeInUp from "../../components/ui/FadeInUp";
import { fetchDrafts } from "../../api/draft";
import { UI_DRAFT_STATUS, STATUS_ROUTES, FILTER_STATUS, buildFilterParams } from "../../constants/draft";

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(FILTER_STATUS.ALL);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 드래프트 목록 조회 (서버 사이드 필터링)
  const {
    data: drafts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["drafts", activeFilter],
    queryFn: () => fetchDrafts(buildFilterParams(activeFilter)),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // 카드 액션 핸들러 (상태 기반 네비게이션)
  const handleCardAction = useCallback((draft) => {
    if (!user) {
      setIsAlertOpen(true);
      return;
    }

    const { status, id, isParticipating } = draft;

    // 모집중 상태에서 미참여자는 참가 모달 표시
    if (status === UI_DRAFT_STATUS.RECRUITING && !isParticipating) {
      setSelectedDraftId(id);
      setIsJoinModalOpen(true);
      return;
    }

    // 상태별 라우트로 이동 (상수 매핑 사용)
    const getRoute = STATUS_ROUTES[status] || STATUS_ROUTES[UI_DRAFT_STATUS.RECRUITING];
    navigate(getRoute(id));
  }, [user, navigate]);

  const handleCreateTournament = () => {
    if (!user) {
      setIsAlertOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleJoinWithCode = () => {
    if (!user) {
      setIsAlertOpen(true);
      return;
    }
    setSelectedDraftId(null);
    setIsJoinModalOpen(true);
  };

  const handleContact = () => {
    // TODO: 문의 페이지로 이동 또는 이메일
  };

  const handleAlertConfirm = () => {
    navigate("/login");
  };

  return (
    <>
      <HeroSection
        onCreateClick={handleCreateTournament}
        onJoinClick={handleJoinWithCode}
      />

      <div className="relative z-10 mx-auto -mt-24 max-w-7xl space-y-20 px-6 pb-20">
        <FadeInUp delay={0}>
          <TournamentSection
            drafts={drafts}
            isLoading={isLoading}
            isError={isError}
            error={error}
            refetch={refetch}
            onCardAction={handleCardAction}
            isLoggedIn={!!user}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </FadeInUp>
        <CTASection
          onCreateClick={handleCreateTournament}
          onContactClick={handleContact}
        />
      </div>
      <JoinWithCodeModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        draftId={selectedDraftId}
      />
      <CreateDraftModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleAlertConfirm}
        title="로그인 필요"
        message="이 기능을 사용하려면 로그인이 필요합니다."
        icon="lock"
        variant="info"
      />
    </>
  );
}
