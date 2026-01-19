import styles from "./AuthButton.module.css";

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
  const buttonClass = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : "",
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
      <span className={styles.glowLayer} />
      <span className={styles.shineLayer} />

      {/* Content */}
      <span className={styles.content}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.text}>{children}</span>
      </span>

      {/* Edge Highlight */}
      <span className={styles.edgeHighlight} />
    </button>
  );
};

export default Button;
