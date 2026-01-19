import styles from "./SectionDivider.module.css";

/**
 * 섹션 구분 컴포넌트
 *
 * @param {string} label - 표시할 텍스트
 * @param {string} type - 타입 ('center-line' | 'section-header')
 *   - center-line: "또는" 같은 중앙 텍스트 구분선
 *   - section-header: "계정 정보" 같은 섹션 헤더
 * @param {string} className - 추가 클래스명
 */
const SectionDivider = ({ label, type = "center-line", className = "" }) => {
  if (type === "section-header") {
    return (
      <div className={`${styles.sectionHeader} ${className}`}>
        <span className={styles.sectionText}>{label}</span>
        <div className={styles.sectionLine} />
      </div>
    );
  }

  // center-line (기본값)
  return (
    <div className={`${styles.centerLine} ${className}`}>
      <div className={styles.line} />
      <span className={styles.centerText}>{label}</span>
      <div className={styles.line} />
    </div>
  );
};

export default SectionDivider;
