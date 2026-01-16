import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-dark/95 backdrop-blur-md">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-8">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="group flex cursor-pointer items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm border border-primary-bright/30 bg-gold-gradient shadow-[0_0_15px_rgba(200,155,60,0.4)]">
            <span className="material-symbols-outlined text-2xl font-bold text-background-dark">
              gavel
            </span>
          </div>
          <div className="-space-y-1 flex flex-col justify-center">
            <h1 className="font-display text-xl font-bold tracking-[0.1em] text-primary">
              LoL <span className="text-primary-bright">AUCTION</span>
            </h1>
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-slate-500">
              Draft Simulator
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <NavLink to={ROUTES.HOME} active>Home</NavLink>
          <NavLink to="#">Drafts</NavLink>
          <NavLink to="#">B/P Simulator</NavLink>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-8">
          <Link
            to="#"
            className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors hover:text-primary"
          >
            Sign Up
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="rounded-[2px] border border-primary-bright/20 bg-gold-gradient px-8 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-background-dark shadow-[0_0_15px_rgba(200,155,60,0.2)] transition-all hover:brightness-110 active:scale-95"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children, active = false }) {
  const baseClasses = "text-sm font-bold uppercase tracking-[0.15em] py-2 transition-colors";
  const activeClasses = "relative text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:shadow-[0_0_8px_#C89B3C]";
  const inactiveClasses = "text-slate-400 hover:text-primary-bright";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {children}
    </Link>
  );
}
