import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { Icon } from "../../../components/ui";
import { Header } from "../../../components/layout/index.js";

/**
 * Draft 전용 레이아웃
 * - 전체 화면 사용 (h-screen)
 * - 최소 너비 설정으로 작은 화면에서 가로 스크롤 허용
 * - 헤더 + 메인 + 푸터 구조
 */
export default function DraftLayout({ children }) {
  return (
    <div className="flex h-screen min-w-[1024px] flex-col bg-background-dark font-display text-white">
      <Header/>
      <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
      <DraftFooter />
    </div>
  );
}

function DraftHeader() {
  return (
    <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-primary/30 bg-background-dark px-10">
      {/* 로고 */}
      <Link to={ROUTES.HOME} className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-sm bg-gold-gradient">
          <Icon name="gavel" className="text-xl font-bold text-background-dark" />
        </div>
        <h1 className="text-xl font-bold uppercase italic tracking-[0.2em] text-primary">
          Draft-<span className="text-primary-bright">GO</span>
        </h1>
      </Link>

      {/* 네비게이션 */}
      <nav className="flex items-center gap-12">
        <NavLink to={ROUTES.HOME}>Home</NavLink>
        <NavLink to={ROUTES.DRAFT} active>
          Drafts
        </NavLink>
        <NavLink to="#">B/P</NavLink>
      </nav>

      {/* 인증 버튼 */}
      <div className="flex items-center gap-8">
        <Link
          to="#"
          className="text-xs font-bold uppercase tracking-[0.2em] text-primary-bright/80 transition-colors hover:text-white"
        >
          Sign Up
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className="rounded-sm bg-primary px-8 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-background-dark shadow-[0_0_15px_rgba(200,155,60,0.2)] transition-all hover:bg-hextech-gold-bright"
        >
          Login
        </Link>
      </div>
    </header>
  );
}

function NavLink({ to, children, active = false }) {
  const baseClasses =
    "text-xs font-bold uppercase tracking-[0.2em] transition-colors";
  const activeClasses = "text-primary";
  const inactiveClasses = "text-primary-bright/70 hover:text-primary";

  return (
    <Link to={to} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {children}
    </Link>
  );
}

function DraftFooter() {
  return (
    <footer className="z-50 flex shrink-0 items-center justify-between border-t border-primary/20 bg-background-dark px-10 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
      <div className="flex gap-6">
        <span>서버: KR-1</span>
        <span>버전: 14.10.1</span>
      </div>
      <div className="italic">Hextech Auction Draft Engine - Pro Gold Edition</div>
    </footer>
  );
}
