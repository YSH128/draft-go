import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo/draft-go-logo.png";

export default function Footer() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpRef = useRef(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <footer className="w-full border-t border-[#1e282d] bg-[var(--color-header-bg)] px-8 py-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center gap-1 md:items-start">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Draft-GO"
              className="h-8 w-auto drop-shadow-[0_0_1px_#c89b3c]"
            />
            <span className="font-display text-lg font-bold tracking-wide text-white">
              Draft-GO
            </span>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 SSAFY-14th A205. All rights reserved.
          </p>
        </div>

        {/* Right Side: Links & Utility */}
        <div className="flex items-center gap-6">
          <nav className="flex gap-6">
            <Link
              to="#"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              to="#"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Contact Us
            </Link>
          </nav>

          {/* Help Button & Dropdown */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black shadow-md transition-colors hover:bg-gray-200"
              aria-label="Help"
            >
              ?
            </button>

            {/* Dropdown Menu */}
            {isHelpOpen && (
              <div className="absolute right-0 bottom-full z-50 mb-3 w-56 rounded-md border border-[#1e282d] bg-[#1e2328] py-2 shadow-xl">
                {/* Group 1 */}
                <div className="flex flex-col">
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    이용 가이드
                  </Link>
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    패치 노트
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-white/5"></div>

                {/* Group 2 */}
                <div className="flex flex-col">
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    버그 제보
                  </Link>
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    개발팀 문의
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-white/5"></div>

                {/* Group 3 */}
                <div className="flex flex-col">
                  <button
                    onClick={() => alert("준비 중입니다.")}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    언어 변경 (한국어)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
