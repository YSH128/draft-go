import {
  HeroSection,
  StatsSection,
  TournamentSection,
  CTASection,
} from "./sections";
import { useState } from "react";
import JoinWithCodeModal from "../../components/Ui/JoinWithCodeModal";

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCreateTournament = () => {
    console.log("Create tournament clicked");
    // TODO: 대회 생성 페이지로 이동 또는 모달 열기
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
    </>
  );
}
