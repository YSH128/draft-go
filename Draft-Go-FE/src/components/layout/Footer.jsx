import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-primary/20 bg-background-dark pb-8 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
      {/* 상단 그라데이션 라인 */}
      <div className="absolute left-1/2 top-0 h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 sm:mb-12 sm:gap-10 md:mb-16 md:grid-cols-12 md:gap-12">
          {/* 로고 & 설명 */}
          <div className="flex flex-col gap-4 sm:gap-6 md:col-span-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex size-8 items-center justify-center rounded-sm bg-primary sm:size-10">
                <span className="material-symbols-outlined text-xl font-bold text-background-dark sm:text-2xl">
                  gavel
                </span>
              </div>
              <h1 className="text-xl font-black tracking-widest text-primary-bright sm:text-2xl">
                DRAFT-<span className="text-primary">GO</span>
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base md:text-lg">
              이스포츠 드래프트를 위한 가장 스마트한 선택.
              <br />
              실시간 경매 시스템으로 더 공정하고 재미있는 대회를 만들어보세요.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <SocialButton icon="share" />
              <SocialButton icon="chat_bubble" />
              <SocialButton icon="help" />
            </div>
          </div>

          {/* 링크 그룹 */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 md:col-span-7 md:gap-4">
            <FooterLinkGroup title="Service">
              <FooterLink href="#">대회 만들기</FooterLink>
              <FooterLink href="#">진행 방식 가이드</FooterLink>
              <FooterLink href="#">포인트 정책</FooterLink>
              <FooterLink href="#">이용 꿀팁</FooterLink>
            </FooterLinkGroup>

            <FooterLinkGroup title="Community">
              <FooterLink href="#">공지사항</FooterLink>
              <FooterLink href="#">자유 게시판</FooterLink>
              <FooterLink href="#">디스코드</FooterLink>
              <FooterLink href="#">패치 노트</FooterLink>
            </FooterLinkGroup>

            <FooterLinkGroup title="Legal">
              <FooterLink href="#">이용약관</FooterLink>
              <FooterLink href="#">개인정보처리방침</FooterLink>
              <FooterLink href="#">청소년 보호방침</FooterLink>
              <FooterLink href="#">쿠키 정책</FooterLink>
            </FooterLinkGroup>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:gap-6 sm:pt-8 md:flex-row">
          <p className="text-xs font-medium text-slate-600 sm:text-sm">
            © 2024 LoL Auction Team. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-8">
            <FooterBadge color="primary" text="Designed for Gamers" />
            <FooterBadge color="hextech-blue" text="Hextech UI v2.0" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialButton({ icon }) {
  return (
    <a
      href="#"
      className="flex size-10 items-center justify-center rounded-sm border border-white/10 bg-card-dark text-slate-400 transition-all hover:border-primary hover:text-primary"
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </a>
  );
}

function FooterLinkGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary before:h-3 before:w-1 before:bg-primary before:content-['']">
        {title}
      </span>
      <nav className="flex flex-col gap-3">{children}</nav>
    </div>
  );
}


function FooterLink({ href, children }) {
  return (
    <Link
      to={href}
      className="text-sm font-medium text-slate-400 transition-colors hover:text-primary-bright"
    >
      {children}
    </Link>
  );
}

function FooterBadge({ color, text }) {
  const colorClass = color === "primary" ? "bg-primary" : "bg-primary";
  // const colorClass = "text-primary";
  return (
    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
      <span className={`size-1.5 rounded-full ${colorClass}`} />
      {text}
    </span>
  );
}
