import { GoldButton } from "../../../components/ui";
import FadeInUp from "../../../components/ui/FadeInUp";
import poppyBg from "../../../assets/images/poppy.png";

export default function CTASection({ onCreateClick }) {
  // Hextech Diamond Pattern (Simple SVG data URI)
  const diamondPattern = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(200, 155, 60, 0.05)' stroke-width='1'/%3E%3C/svg%3E`;

  return (
    <section className="mb-20 mt-10 px-4 sm:px-6">
      <FadeInUp>
        <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-xl border border-[#c89b3c] bg-[#0f141e] shadow-[0_0_20px_rgba(200,155,60,0.15)]">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-50"
            style={{ backgroundImage: `url("${diamondPattern}")` }}
          />

          {/* Character Background (Poppy) */}
          <div
            className="absolute top-0 right-0 h-full w-[60%] md:w-[50%] bg-cover bg-right-center bg-no-repeat z-0"
            style={{
              backgroundImage: `url("${poppyBg}")`,
              maskImage: "linear-gradient(to left, black 40%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, black 40%, transparent 100%)",
            }}
          />

          {/* Hextech Glow Effects */}
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />
          
          <div className="relative z-10 w-full md:max-w-[75%] flex flex-col md:flex-row items-center md:justify-start gap-8 px-8 py-14 md:px-12 lg:px-16">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-3xl whitespace-nowrap">
                경매를 통해 팀 밸런스를 재미있게!
              </h2>
              <p className="mt-3 text-base text-gray-400 md:text-lg whitespace-nowrap">
                복잡한 준비 없이, 클릭 한 번으로 팀빌딩을 시작해보세요.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <GoldButton
                size="lg"
                variant="primary"
                onClick={onCreateClick}
                className="min-w-[180px] shadow-lg"
              >
                대회 생성하기
              </GoldButton>
            </div>
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}
