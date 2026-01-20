import { forwardRef } from "react";

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
 * @param {string} className - Wrapper 클래스명
 * @param {string} inputClassName - Input 요소 클래스명 (Padding 조절 등)
 * @param {boolean} hideStatusIcon - 내부 상태 아이콘 숨김 여부
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
      hideStatusIcon = false,
      className = "",
      inputClassName = "",
    },
    ref
  ) => {
    // 에러 상태일 때만 border 스타일 변경 (성공 시 border는 기본값 유지)
    const hasError = !!error || isError;

    const inputClasses = [
      "peer w-full h-[42px] pt-[18px] pb-[4px] pl-[12px] pr-[36px]",
      "text-[13px] font-[inherit]",
      "bg-gradient-to-b from-[#1a1f24] to-[#12171b]",
      "border rounded-[3px] outline-none transition-all duration-200",
      "shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] placeholder-transparent",
      hasError
        ? "border-[#e84057] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_4px_rgba(232,64,87,0.15)]"
        : "border-[#3c3c41] focus:border-[#c8aa6e] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25),0_0_0_1px_rgba(200,170,110,0.25),0_0_6px_rgba(200,170,110,0.15)] hover:not(:focus):border-[#505055]",
      "text-[#f0e6d2]",
      inputClassName,
    ].join(" ");

    const labelClasses = [
      "absolute left-[12px] top-1/2 -translate-y-1/2",
      "text-[12px] pointer-events-none transition-all duration-200",
      hasError ? "text-[#e84057]" : "text-[#6a6a6a]",
      "peer-focus:top-[10px] peer-focus:text-[9px] peer-focus:font-semibold peer-focus:tracking-[0.3px]",
      hasError ? "peer-focus:text-[#e84057]" : "peer-focus:text-[#c8aa6e]",
      "peer-[&:not(:placeholder-shown)]:top-[10px] peer-[&:not(:placeholder-shown)]:text-[9px] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:tracking-[0.3px]",
      hasError
        ? "peer-[&:not(:placeholder-shown)]:text-[#e84057]"
        : "peer-[&:not(:placeholder-shown)]:text-[#c8aa6e]",
    ].join(" ");

    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative w-full group">
          <input
            ref={ref}
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            placeholder=" "
            className={inputClasses}
            autoComplete="off"
          />
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>

          {/* 상태 아이콘: 로딩 > 에러 > 성공 순 우선순위 */}
          {!hideStatusIcon && (
            <div className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center">
              {isLoading && (
                <div
                  className="w-[14px] h-[14px] border-2 border-[#3c3c41] border-t-[#2ecc71] rounded-full animate-spin"
                  aria-label="확인 중"
                />
              )}
              {!isLoading && isError && !hideErrorIcon && (
                <svg
                  className="w-[14px] h-[14px] text-[#e84057]"
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
                  className="w-[16px] h-[16px] text-[#2ecc71] transition-transform duration-150 scale-100"
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
          )}

          {/* Inner glow overlay (focus 시 표시) */}
          <div className="absolute inset-0 rounded-[3px] pointer-events-none opacity-0 transition-opacity duration-200 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(200,170,110,0.08)_0%,transparent_60%)] group-focus-within:opacity-100" />
        </div>

        {/* 안내 문구 영역 (에러 + 헬퍼 텍스트) */}
        <div className="mt-[2px] mx-[2px] min-h-[10px] flex justify-start items-start gap-3">
          {error && (
            <span className="block text-[#e84057] text-[11px] font-medium leading-[1.4]">
              {error}
            </span>
          )}
          {helperText}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
