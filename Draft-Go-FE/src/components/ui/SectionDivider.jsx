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
      <div className={`mb-3 mt-4 first:mt-0 ${className}`}>
        <span className="inline-block text-[10px] font-bold text-[#c8aa6e] uppercase tracking-[1px] mb-[6px]">
          {label}
        </span>
        <div className="h-[1px] bg-[linear-gradient(90deg,#c8aa6e_0%,#785a28_30%,#3c3c41_60%,transparent_100%)]" />
      </div>
    );
  }

  // center-line (기본값)
  return (
    <div className={`flex items-center gap-3 my-4 ${className}`}>
      <div className="flex-1 h-[1px] bg-[linear-gradient(90deg,transparent_0%,#3c3c41_50%,transparent_100%)]" />
      <span className="text-[10px] font-medium text-[#5c5b57] uppercase tracking-[0.5px] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-[1px] bg-[linear-gradient(90deg,transparent_0%,#3c3c41_50%,transparent_100%)]" />
    </div>
  );
};

export default SectionDivider;
