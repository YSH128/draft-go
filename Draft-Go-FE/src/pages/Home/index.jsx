import {
  HeroSection,
  StatsSection,
  TournamentSection,
  CTASection,
} from "./sections";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinWithCodeModal from "../../components/ui/JoinWithCodeModal";
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import AlertModal from "../../components/ui/AlertModal";
import useAuthStore from "../../stores/useAuthStore";

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
    console.log("Contact clicked");
    // TODO: 문의 페이지로 이동 또는 이메일
  };

  const handleAlertConfirm = () => {
    navigate('/login');
  };

  return (
    <>
      <HeroSection
        onCreateClick={handleCreateTournament}
        onJoinClick={handleJoinWithCode}
      />
      <StatsSection />
      <TournamentSection />
      <CTASection
        onCreateClick={handleCreateTournament}
        onContactClick={handleContact}
      />
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
