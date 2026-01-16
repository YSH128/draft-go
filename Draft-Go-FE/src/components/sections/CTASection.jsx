import { GoldButton, Icon } from "../UI";

export default function CTASection({ onCreateClick, onContactClick }) {
  return (
    <section className="mb-20 mt-20 px-6">
      <div className="group relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[2px] border border-primary/30 bg-card-dark p-12 shadow-2xl md:flex-row md:p-20">
        {/* 배경 장식 */}
        <div className="pointer-events-none absolute -mr-48 -mt-48 right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -mb-48 -ml-48 bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-hextech-blue/5 blur-[120px]" />
        <div className="absolute left-10 top-0 h-20 w-[1px] bg-gradient-to-b from-primary to-transparent opacity-50" />
        <div className="absolute bottom-0 right-10 h-20 w-[1px] bg-gradient-to-t from-primary to-transparent opacity-50" />

        {/* 텍스트 영역 */}
        <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
          <div className="mb-2 inline-block rounded border border-hextech-blue/30 bg-hextech-blue/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-hextech-blue">
            New Feature
          </div>
          <h2 className="text-4xl font-black leading-[1.1] text-white md:text-5xl">
            지금 나만의 대회를
            <br />
            <span className="text-primary">직접 열어보세요!</span>
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-slate-400 md:text-xl">
            완벽한 경매 시스템과 실시간 포인트 동기화, 자동 대진표 기능을
            제공합니다. 복잡한 엑셀은 이제 잊으세요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="relative z-10 flex shrink-0 flex-col gap-5 sm:flex-row">
          <GoldButton
            size="md"
            variant="primary"
            icon="rocket_launch"
            onClick={onCreateClick}
            className="h-14 px-10 text-lg"
          >
            대회 생성하기
          </GoldButton>
          <GoldButton
            size="md"
            variant="ghost"
            icon="mail"
            onClick={onContactClick}
            className="h-14 px-10 text-lg"
          >
            문의하기
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
