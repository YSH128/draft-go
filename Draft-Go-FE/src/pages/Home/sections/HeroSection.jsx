import { GoldButton } from "../../../components/ui";
import riftBg from "../../../assets/images/summoner-rift.jpg";

export default function HeroSection({ onCreateClick, onJoinClick }) {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pb-32">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${riftBg}')` }}
      />

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8">
        
        {/* Main Title */}
        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] md:text-7xl">
          협곡을 지배할
          <br />
          <span className="text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(200,155,60,0.3)]">
            최강의 라인업을 완성하라
          </span>
        </h1>

        {/* Sub Title */}
        <p className="max-w-2xl text-lg font-medium leading-relaxed text-gray-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] md:text-xl">
          오직 실력과 전략으로 증명하는 승부.
          <br className="hidden md:block" />
          실시간 경매 드래프트로 나만의 드림팀을 구축하세요.
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
          <GoldButton
            size="lg"
            variant="primary"
            icon="add_circle"
            onClick={onCreateClick}
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            대회 생성하기
          </GoldButton>
          <GoldButton
            size="lg"
            variant="outline"
            icon="key"
            onClick={onJoinClick}
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            참가 코드로 입장
          </GoldButton>
        </div>
      </div>
    </section>
  );
}

// function PingDot removed as it is no longer used
