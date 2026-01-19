import { forwardRef } from "react";
import styles from "./AuthInput.module.css";

/**
 * Hextech 스타일 Input 컴포넌트
 *
 * @param {string} type - input 타입 (text, password 등)
 * @param {string} id - input 식별자
 * @param {string} label - 플로팅 라벨
 * @param {string} value - 입력값
 * @param {function} onChange - 변경 핸들러
 * @param {function} onBlur - 블러 핸들러
 * @param {string} error - 에러 메시지
 * @param {number} maxLength - 최대 길이
 * @param {boolean} isLoading - 중복체크 로딩 상태
 * @param {boolean} isError - 에러 상태 (중복됨)
 * @param {boolean} isValid - 유효 상태 (체크 아이콘 표시용)
 * @param {string} className - 추가 클래스명
 */
const Input = forwardRef(
  (
    {
      type = "text",
      id,
      label,
      value,
      onChange,
      onBlur,
      error,
      maxLength,
      isLoading = false,
      isError = false,
      isValid = false,
      helperText = null,
      hideErrorIcon = false,
      className = "",
    },
    ref
  ) => {
    // 에러 상태일 때만 border 스타일 변경 (성공 시 border는 기본값 유지)
    const getInputClassName = () => {
      const classes = [styles.inputField];
      if (error || isError) classes.push(styles.error);
      return classes.join(" ");
    };

    return (
      <div className={`${styles.inputGroup} ${className}`}>
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            placeholder=" "
            className={getInputClassName()}
            autoComplete="off"
          />
          <label
            htmlFor={id}
            className={`${styles.inputLabel} ${error || isError ? styles.errorLabel : ""}`}
          >
            {label}
          </label>

          {/* 상태 아이콘: 로딩 > 에러 > 성공 순 우선순위 */}
          <div className={styles.statusIcon}>
            {isLoading && (
              <div className={styles.spinner} aria-label="확인 중" />
            )}
            {!isLoading && isError && !hideErrorIcon && (
              <svg
                className={styles.errorIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {!isLoading && !isError && isValid && (
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Inner glow overlay (focus 시 표시) */}
          <div className={styles.glowOverlay} />
        </div>

        {/* 안내 문구 영역 (에러 + 헬퍼 텍스트) */}
        <div className={styles.helperContainer}>
          {error && <span className={styles.errorMessage}>{error}</span>}
          {helperText}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
