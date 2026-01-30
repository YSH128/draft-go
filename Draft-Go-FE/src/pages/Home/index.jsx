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

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 드래프트 목록 조회 (백엔드가 isParticipating 필드 제공)
  const {
    data: drafts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["drafts"],
    queryFn: () => fetchDrafts(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // 카드 액션 핸들러 (Smart Join)
  const handleCardAction = useCallback((draft) => {
    if (!user) {
      setIsAlertOpen(true);
      return;
    }

    if (draft.isParticipating) {
      // 이미 참여 중 → 대기방으로 바로 이동
      navigate(`/draft/room/${draft.id}`);
    } else {
      // 미참여 → 참여 코드 입력 모달
      setSelectedDraftId(draft.id);
      setIsJoinModalOpen(true);
    }
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
