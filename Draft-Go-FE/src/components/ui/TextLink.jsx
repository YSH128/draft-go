import { Link } from "react-router-dom";
import styles from "./TextLink.module.css";

/**
 * 텍스트 링크 컴포넌트
 *
 * @param {string} to - 링크 경로
 * @param {string} variant - 스타일 타입 ('primary' | 'muted')
 * @param {React.ReactNode} children - 링크 텍스트
 * @param {string} className - 추가 클래스명
 */
const TextLink = ({ to, variant = "primary", children, className = "" }) => {
  return (
    <Link
      to={to}
      className={`${styles.link} ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
};

/**
 * Footer 컨테이너 컴포넌트 (링크 모음용)
 */
export const FooterLinks = ({ children, className = "" }) => {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
};

/**
 * 구분자 (|) 컴포넌트
 */
export const LinkSeparator = () => {
  return <span className={styles.separator}>|</span>;
};

export default TextLink;
