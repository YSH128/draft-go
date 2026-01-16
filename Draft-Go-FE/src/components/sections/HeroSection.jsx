import { GoldButton, Icon } from "../UI";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDSeXjimGM_1hyXzq52xit0XFm4I_fDhfridSiBBmZehSHziTFFxQRkqtQy1v8_HhVwdhA-Etx2EnWQAJhaJBlQeX5ktsEMkZVt-OTiEhCWXs6OvGUznqxhcV7UrRKI-LkABkgyZ2nGcj0JYlcFHhDUntB3ij3-_qCgBUl1ASOOH7lCeECE68p4FsGBJ7sJJfTvSgn4honnoqg-1xuiaRPPLNJZ_eD6EbYEeISvoxMhqex962QbJ0S2nXKg-hjXfGQeCZpt32GWrM4";

export default function HeroSection({ onCreateClick, onJoinClick }) {
  return (
    <section className="relative px-6 pb-20 pt-10">
      <div
        className="group relative flex min-h-[640px] items-center justify-center overflow-hidden rounded-[2rem] border border-primary/20 bg-cover bg-center p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
      >
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-background-dark/60" />
        <div className="hero-gradient absolute inset-0" />

        {/* 상단 장식 라인 */}
        <div className="absolute left-1/2 top-0 h-32 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

        {/* 컨텐츠 */}
        <div className="relative z-10 flex max-w-4xl flex-col gap-8">
          {/* 배지 */}
          <div className="inline-flex items-center gap-3 self-center rounded-full border border-primary/30 bg-background-dark/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary shadow-lg backdrop-blur-md">
            <PingDot />
            Hextech Auction System v2.0
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white drop-shadow-2xl md:text-7xl">
            협곡의 주인을 결정하는
            <br />
            <span className="gold-gradient-text text-glow">전략적 드래프트</span>
          </h1>

          {/* 서브 타이틀 */}
          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-300/90 drop-shadow-lg md:text-2xl">
            포인트를 활용한 실시간 경매 방식으로 최강의 팀을 구성하세요.
            <br className="hidden md:block" />
            당신의 운영 능력이 곧 승리로 이어집니다.
          </p>

          {/* CTA 버튼 */}
          <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <GoldButton
              size="lg"
              variant="primary"
              icon="add_circle"
              onClick={onCreateClick}
              className="w-full min-w-[220px] sm:w-auto"
            >
              대회 생성하기
            </GoldButton>
            <GoldButton
              size="lg"
              variant="outline"
              icon="key"
              onClick={onJoinClick}
              className="w-full min-w-[220px] sm:w-auto"
            >
              참가 코드로 입장
            </GoldButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}
