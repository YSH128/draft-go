import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import logo from "../../assets/images/main-logo-noname.png";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex h-[80px] w-full items-center justify-between bg-[var(--color-header-bg)] px-8 shadow-md">
      {/* Left: Logo & Branding */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Draft-GO Logo" className="h-10 w-auto drop-shadow-[0_0_1px_#c89b3c]" />
        <span className="font-display text-xl font-bold text-white tracking-wide">
          Draft-GO
        </span>
      </Link>

      {/* Right: Auth Buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-[var(--color-primary)]"
            >
              My Page
            </Link>
            <button
              onClick={handleLogout}
              className="rounded border border-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-black"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-[var(--color-primary)]"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-black transition-all hover:bg-[var(--color-hextech-gold-dark)]"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
