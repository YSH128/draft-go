import React from 'react';
import Button from '../../components/ui/Button.jsx';
import TournamentCard from '../../components/ui/TournamentCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import ChatInput from '../../components/ui/ChatInput.jsx';
import ChatBubble from '../../components/ui/ChatBubble.jsx';
import TeamLeaderCard from '../../components/ui/TeamLeaderCard.jsx';
import DraftTeamLeaderCard from '../../components/ui/DraftTeamLeaderCard.jsx';
import DraftMemberCard from '../../components/ui/DraftMemberCard.jsx';
import ActiveBidderCard from '../../components/ui/ActiveBidderCard.jsx';
import SectionTitle from '../../components/ui/SectionTitle.jsx';

export default function Index() {
  return (
    <div className="min-h-screen bg-background-dark p-8 space-y-12 text-white font-display">
      <header className="mb-12 border-b border-hextech-gold/30 pb-6">
        <h1 className="text-4xl text-primary font-black tracking-tighter mb-2">HEXTECH UI SYSTEM</h1>
        <p className="text-hextech-gold-bright/60">Extracted Design Tokens & Components</p>
      </header>

      {/* Buttons Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-hextech-gold border-l-4 border-primary pl-4">Buttons</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="primary" size="lg">로그인 (Login)</Button>
          <Button variant="primary" size="md">대회 생성 (Create)</Button>
          <Button variant="outline" size="md">참가 코드 (Join)</Button>
          <Button variant="ghost" size="md">회원가입 (Sign Up)</Button>
        </div>
        <div className="max-w-md">
            <Button variant="bid" size="full">
                <span>입찰 (+20 P)</span>
                <span className="text-[10px] opacity-80 tracking-widest mt-1">다음 입찰가: 260 P</span>
            </Button>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-hextech-gold border-l-4 border-primary pl-4">Badges & Tags</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="iron">Iron</Badge>
          <Badge variant="bronze">Bronze</Badge>
          <Badge variant="silver">Silver</Badge>
          <Badge variant="gold">Gold</Badge>
          <Badge variant="platinum">Platinum</Badge>
          <Badge variant="emerald">Emerald</Badge>
          <Badge variant="diamond">Diamond</Badge>
          <Badge variant="master">Master</Badge>
          <Badge variant="grandmaster">Grandmaster</Badge>
          <Badge variant="challenger">Challenger</Badge>
        </div>
        <div className="flex flex-wrap gap-4">
          <Badge variant="recruiting">모집중 (Recuriting)</Badge>
          <Badge variant="ongoing">진행중 (Ongoing)</Badge>
          <Badge variant="bid">현재 입찰 1위</Badge>
        </div>
      </section>

      {/* Avatars Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-hextech-gold border-l-4 border-primary pl-4">Avatars & Tiers</h2>
        <div className="flex items-center gap-8">
            <div className="text-center space-y-2">
                <Avatar size="xl" tier="challenger" src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png" />
                <p className="font-bold text-primary">Challenger</p>
            </div>
            <div className="text-center space-y-2">
                <Avatar size="lg" tier="grandmaster" src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vayne.png" />
                <p className="font-bold text-red-500">Grandmaster</p>
            </div>
            <div className="text-center space-y-2">
                <Avatar size="md" tier="master" src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png" />
                <p className="font-bold text-purple-500">Master</p>
            </div>
            <div className="text-center space-y-2">
                <Avatar size="sm" tier="diamond" src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ezreal.png" />
                <p className="font-bold text-blue-400">Diamond</p>
            </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-hextech-gold border-l-4 border-primary pl-4">Tournament Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Tournament Card */}
            <TournamentCard>
                 <div className="h-40 bg-gradient-to-t from-background-dark to-gray-800 relative">
                    <span className="absolute top-4 left-4"><Badge variant="recruiting">모집중</Badge></span>
                 </div>
                 <div className="p-6">
                    <h3 className="text-xl font-black text-white mb-2">제 3회 사내 롤 대회</h3>
                    <p className="text-sm text-gray-400">Host: 페이커</p>
                 </div>
            </TournamentCard>
            
            <TournamentCard>
                 <div className="h-40 bg-gradient-to-t from-background-dark to-gray-800 relative">
                    <span className="absolute top-4 left-4"><Badge variant="ongoing">진행중</Badge></span>
                 </div>
                 <div className="p-6">
                    <h3 className="text-xl font-black text-white mb-2">SSAFY 14기 토너먼트</h3>
                    <p className="text-sm text-gray-400">Host: 운영진</p>
                 </div>
            </TournamentCard>
        </div>
      </section>

      {/* Specific Components Section (New) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-hextech-gold border-l-4 border-primary pl-4">Specific Requested Components</h2>
        
        {/* Draft Team Leader Card Demo (Renamed) */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-400">Draft Team Leader Card</h3>
            <div className="flex flex-col gap-4">
                <DraftTeamLeaderCard teamName="Green Delta" points={800} color="green" status="bidding" />
                <DraftTeamLeaderCard teamName="Blue Alpha" points={420} color="blue" status="waiting" />
            </div>
        </div>

        {/* Draft Member Card Demo (New) */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-400">Draft Member Card</h3>
            <div className="flex flex-col gap-4">
               <DraftMemberCard playerName="Player Alpha" role="TOP" tier="DIAMOND" imageSrc="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Garen.png" />
               <DraftMemberCard playerName="Player Beta" role="JUNGLE" tier="GOLD" imageSrc="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png" />
            </div>
        </div>
        
        {/* Active Bidder Card Demo (New) */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-400">Active Bidder Card</h3>
            <div className="flex justify-center">
               <ActiveBidderCard />
            </div>
        </div>

        {/* Chat UI Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-400">Chat UI</h3>
                <div className="bg-[#050c12] border border-[#c89b3c]/20 p-4 rounded-xl h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2">
                         <ChatBubble sender="Player 1" message="이번 드래프트 팀장님들 다들 티어가 높네요. 재미있을 것 같습니다." variant="other" />
                         <ChatBubble sender="System" message="방장님이 대회 규칙을 변경하였습니다." variant="system" />
                         <ChatBubble sender="나 (Me)" message="준비되시면 바로 경매 시작하겠습니다!" variant="me" />
                         <ChatBubble sender="Canyon Fan" message="ㄱㄱㄱ" variant="other" />
                    </div>
                    <div className="mt-4">
                        <ChatInput />
                    </div>
                </div>
            </div>

            {/* Team Leader Card Demo */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-400">Team Leader Card</h3>
                <div className="flex justify-center">
                    <TeamLeaderCard captainName="Faker" tier="challenger" mainRole="MID" teamNumber={1} />
                </div>
            </div>
        </div>

        {/* Section Title Demo */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-400">Section Title</h3>
            <SectionTitle>진행 중인 대회</SectionTitle>
        </div>
      </section>
    </div>
  );
}
