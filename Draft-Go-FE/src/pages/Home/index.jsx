import {
  HeroSection,
  StatsSection,
  TournamentSection,
  CTASection,
} from "./sections";

export default function HomePage() {
  const handleCreateTournament = () => {
    console.log("Create tournament clicked");
    // TODO: 대회 생성 페이지로 이동 또는 모달 열기
  };

  const handleJoinWithCode = () => {
    console.log("Join with code clicked");
    // TODO: 참가 코드 입력 모달 열기
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
    </>
  );
}
