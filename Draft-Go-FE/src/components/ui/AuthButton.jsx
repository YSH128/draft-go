/**
 * Hextech 스타일 Button 컴포넌트
 *
 * @param {string} variant - 버튼 스타일 (primary, secondary, riot)
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} fullWidth - 전체 너비 사용
 * @param {function} onClick - 클릭 핸들러
 * @param {string} type - 버튼 타입 (button, submit)
 * @param {React.ReactNode} children - 버튼 내용
 * @param {React.ReactNode} icon - 아이콘 (좌측)
 * @param {string} className - 추가 클래스명
 */
const Button = ({
  variant = "primary",
  disabled = false,
  fullWidth = true,
  onClick,
  type = "button",
  children,
  icon,
  className = "",
}) => {
  const baseClasses =
    "group relative h-[40px] px-5 border-none rounded-[3px] text-[13px] font-bold font-[inherit] uppercase tracking-[0.5px] cursor-pointer overflow-hidden isolate transition-all duration-200 disabled:bg-gradient-to-b disabled:from-[#2a2a30] disabled:to-[#1a1a1e] disabled:text-[#5c5c60] disabled:cursor-not-allowed disabled:shadow-none disabled:border disabled:border-[#3c3c41] focus-visible:outline-2 focus-visible:outline-[#c8aa6e] focus-visible:outline-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-b from-[#c89b3c] to-[#785a28] text-[#010a13] shadow-[0_2px_4px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:not(:disabled):from-[#d4a84a] hover:not(:disabled):to-[#8c6830] hover:not(:disabled):shadow-[0_3px_8px_rgba(200,170,110,0.35)] active:not(:disabled):from-[#a07d30] active:not(:disabled):to-[#5c4020]",
    secondary:
      "bg-gradient-to-b from-[#3c3c41] to-[#1e2328] text-[#a09b8c] shadow-[0_2px_4px_rgba(0,0,0,0.25)] border border-[#5c5c60] hover:not(:disabled):from-[#4a4a50] hover:not(:disabled):to-[#252a30] hover:not(:disabled):text-[#c8aa6e] hover:not(:disabled):border-[#c8aa6e] active:not(:disabled):from-[#2a2a30] active:not(:disabled):to-[#151820]",
    riot:
      "bg-gradient-to-b from-[#d13639] to-[#8c2426] text-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] hover:not(:disabled):from-[#e04245] hover:not(:disabled):to-[#a02a2d] hover:not(:disabled):shadow-[0_3px_8px_rgba(209,54,57,0.35)] active:not(:disabled):from-[#b02a2d] active:not(:disabled):to-[#701a1c]",
  };

  const glowStyles = {
    primary:
      "bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(200,170,110,0.5)_0%,transparent_70%)]",
    secondary:
      "bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(160,155,140,0.25)_0%,transparent_70%)]",
    riot: "bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(255,80,80,0.4)_0%,transparent_70%)]",
  };

  const edgeStyles = {
    primary:
      "shadow-[inset_0_0_10px_rgba(255,215,100,0.3),0_0_12px_rgba(200,170,110,0.4)]",
    secondary:
      "shadow-[inset_0_0_8px_rgba(200,170,110,0.15),0_0_10px_rgba(200,170,110,0.15)]",
    riot: "shadow-[inset_0_0_10px_rgba(255,100,100,0.3),0_0_12px_rgba(209,54,57,0.4)]",
  };

  const buttonClass = [
    baseClasses,
    variants[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Hextech Glow Layers */}
      <span
        className={`absolute inset-0 z-10 opacity-0 transition-opacity duration-200 group-hover:not(:disabled):opacity-100 ${glowStyles[variant]}`}
      />
      <span className="absolute top-0 -left-full w-full h-full z-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_50%,transparent_100%)] transition-[left] duration-400 ease-out group-hover:not(:disabled):left-full" />

      {/* Content */}
      <span className="relative z-30 flex items-center justify-center gap-2">
        {icon && (
          <span
            className={`flex items-center justify-center w-[18px] h-[18px] ${
              variant === "riot" ? "brightness-0 invert" : ""
            }`}
          >
            {icon}
          </span>
        )}
        <span className="leading-none">{children}</span>
      </span>

      {/* Edge Highlight */}
      <span
        className={`absolute inset-0 z-0 rounded-[3px] opacity-0 transition-opacity duration-200 group-hover:not(:disabled):opacity-100 ${edgeStyles[variant]}`}
      />
    </button>
  );
};

export default Button;
