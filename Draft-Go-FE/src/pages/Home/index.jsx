import {
  HeroSection,
  StatsSection,
  TournamentSection,
  CTASection,
} from "./sections";
import { useState } from "react";
import JoinWithCodeModal from "../../components/ui/JoinWithCodeModal";
import CreateDraftModal from "../../components/ui/CreateDraftModal";

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTournament = () => {
    setIsCreateModalOpen(true);
  };

  const handleJoinWithCode = () => {
    setIsJoinModalOpen(true);
  };

  const handleContact = () => {
    console.log("Contact clicked");
    // TODO: 문의 페이지로 이동 또는 이메일
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
    </>
  );
}
