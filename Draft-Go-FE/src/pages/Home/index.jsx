import { HeroSection, TournamentSection, CTASection } from "./sections";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinWithCodeModal from "../../components/ui/JoinWithCodeModal";
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import AlertModal from "../../components/ui/AlertModal";
import useAuthStore from "../../stores/useAuthStore";
import FadeInUp from "../../components/ui/FadeInUp";

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
          <TournamentSection />
        </FadeInUp>
        <CTASection
          onCreateClick={handleCreateTournament}
          onContactClick={handleContact}
        />
      </div>
      <JoinWithCodeModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
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
