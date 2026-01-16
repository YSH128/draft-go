import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-primary/20 bg-background-dark pb-12 pt-20">
      {/* 상단 그라데이션 라인 */}
      <div className="absolute left-1/2 top-0 h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* 로고 & 설명 */}
          <div className="flex flex-col gap-6 md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-sm bg-primary">
                <span className="material-symbols-outlined font-bold text-background-dark">
                  gavel
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-widest text-primary-bright">
                LOL <span className="text-primary">AUCTION</span>
              </h1>
            </div>
            <p className="max-w-sm text-lg leading-relaxed text-slate-500">
              이스포츠 드래프트를 위한 가장 스마트한 선택.
              <br />
              실시간 경매 시스템으로 더 공정하고 재미있는 대회를 만들어보세요.
            </p>
            <div className="flex gap-4">
              <SocialButton icon="share" />
              <SocialButton icon="chat_bubble" />
              <SocialButton icon="help" />
            </div>
          </div>

          {/* 링크 그룹 */}
          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3 md:gap-4">
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
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-sm font-medium text-slate-600">
            © 2024 LoL Auction Team. All rights reserved.
          </p>
          <div className="flex gap-8">
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
  const colorClass = color === "primary" ? "bg-primary" : "bg-hextech-blue";
  return (
    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
      <span className={`size-1.5 rounded-full ${colorClass}`} />
      {text}
    </span>
  );
}
