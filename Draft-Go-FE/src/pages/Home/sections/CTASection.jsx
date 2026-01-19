import { GoldButton } from "../../../components/ui";

export default function CTASection({ onCreateClick, onContactClick }) {
  return (
    <section className="mb-10 mt-10 px-4 sm:mb-16 sm:mt-16 sm:px-6 md:mb-20 md:mt-20">
      <div className="group relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2px] border border-primary/30 bg-card-dark p-6 shadow-2xl sm:gap-10 sm:p-10 md:flex-row md:gap-12 md:p-20">
        {/* 배경 장식 */}
        <div className="pointer-events-none absolute -mr-48 -mt-48 right-0 top-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />
        <div className="pointer-events-none absolute -mb-48 -ml-48 bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-hextech-blue/5 blur-[80px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />
        <div className="absolute left-6 top-0 h-12 w-[1px] bg-gradient-to-b from-primary to-transparent opacity-50 sm:left-10 sm:h-20" />
        <div className="absolute bottom-0 right-6 h-12 w-[1px] bg-gradient-to-t from-primary to-transparent opacity-50 sm:right-10 sm:h-20" />

        {/* 텍스트 영역 */}
        <div className="relative z-10 flex-1 space-y-4 text-center sm:space-y-6 md:text-left">
          <div className="mb-2 inline-block rounded border border-hextech-blue/30 bg-hextech-blue/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-hextech-blue sm:px-3 sm:text-[10px]">
            New Feature
          </div>
          <h2 className="text-2xl font-black leading-[1.1] text-white sm:text-4xl md:text-5xl">
            지금 나만의 대회를
            <br />
            <span className="text-primary">직접 열어보세요!</span>
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-400 sm:text-lg md:text-xl">
            완벽한 경매 시스템과 실시간 포인트 동기화, 자동 대진표 기능을
            제공합니다. 복잡한 엑셀은 이제 잊으세요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="relative z-10 flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:gap-5">
          <GoldButton
            size="md"
            variant="primary"
            icon="rocket_launch"
            onClick={onCreateClick}
            className="h-12 px-6 text-base sm:h-14 sm:px-10 sm:text-lg"
          >
            대회 생성하기
          </GoldButton>
          <GoldButton
            size="md"
            variant="ghost"
            icon="mail"
            onClick={onContactClick}
            className="h-12 px-6 text-base sm:h-14 sm:px-10 sm:text-lg"
          >
            문의하기
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
