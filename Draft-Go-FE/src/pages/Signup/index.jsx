import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";

import useSignupForm from "../../hooks/useSignupForm";

// Position Icons
import topIcon from "../../assets/positions/top.svg";
import jungleIcon from "../../assets/positions/jungle.svg";
import midIcon from "../../assets/positions/mid.svg";
import botIcon from "../../assets/positions/bot.png";
import supIcon from "../../assets/positions/sup.svg";

// 비밀번호 강도별 스타일 매핑


const POSITIONS = [
  { id: "TOP", icon: topIcon, label: "TOP" },
  { id: "JUNGLE", icon: jungleIcon, label: "JUNGLE" },
  { id: "MID", icon: midIcon, label: "MID" },
  { id: "BOT", icon: botIcon, label: "BOT" },
  { id: "SUP", icon: supIcon, label: "SUP" },
];

const TIERS = [
  { value: "UNRANKED", label: "언랭" },
  { value: "IRON", label: "아이언" },
  { value: "BRONZE", label: "브론즈" },
  { value: "SILVER", label: "실버" },
  { value: "GOLD", label: "골드" },
  { value: "PLATINUM", label: "플래티넘" },
  { value: "EMERALD", label: "에메랄드" },
  { value: "DIAMOND", label: "다이아" },
  { value: "MASTER", label: "마스터" },
  { value: "GRANDMASTER", label: "그랜드마스터" },
  { value: "CHALLENGER", label: "챌린저" },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Layout State for new fields (Position/Tier)
  const [mainPosition, setMainPosition] = useState(null);
  const [subPosition, setSubPosition] = useState(null);
  const [tier, setTier] = useState("");
  const [division, setDivision] = useState("4"); // Default division

  const {
    formData,
    errors,
    loadingFields,
    duplicateErrors,
    handleUsernameChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleGameNameChange,
    handleTagLineChange,
    validFields,
    handleCheckDuplicate,
    handleSummonerBlur,
    isSummonerChecked,
  } = useSignupForm();

  const handleApiSignup = async () => {
    const isAllValid = Object.values(validFields).every(Boolean);

    if (!isAllValid) {
      alert("입력 정보를 다시 확인해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // API Schema Mapping
      // Rank Transformation: Tier + Division (e.g., GOLD_4)
      let rankValue = tier;
      const standardTiers = [
        "IRON",
        "BRONZE",
        "SILVER",
        "GOLD",
        "PLATINUM",
        "EMERALD",
        "DIAMOND",
      ];

      if (standardTiers.includes(tier)) {
        rankValue = `${tier}_${division}`;
      }

      await signup({
        username: formData.username,
        password: formData.password,
        gameName: formData.gameName,
        tagLine: formData.tagLine.replace(/^#/, ""),
        mainPosition,
        subPosition,
        rank: rankValue,
        leaguePoint: 0,
      });

      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-950 px-4 pt-16 pb-16">
      <div className="h-fit w-full max-w-[520px] rounded-lg border border-[#c8aa6e]/30 bg-gray-900/80 p-8 shadow-xl backdrop-blur-sm">
        {/* 타이틀 */}
        <h1 className="mb-6 text-center text-3xl font-bold tracking-wider text-white">
          회원가입
        </h1>

        <div className="space-y-4">
          {/* 계정 정보 섹션 */}
          <SectionDivider label="계정 정보" type="section-header" />

          {/* 아이디 */}
          <div className="relative">
            <AuthInput
              id="username"
              label="아이디"
              value={formData.username}
              onChange={handleUsernameChange}
              error={errors.username}
              isLoading={loadingFields.username}
              isError={duplicateErrors.username}
              isValid={validFields.username}
              inputClassName="pr-[100px]"
              hideStatusIcon={true}
            />
            
            <div className="absolute right-3 top-[21px] -translate-y-1/2 z-10 flex items-center gap-2">
              {/* Status Icon */}
              {loadingFields.username && (
                <div
                  className="w-[14px] h-[14px] border-2 border-[#3c3c41] border-t-[#2ecc71] rounded-full animate-spin"
                  aria-label="확인 중"
                />
              )}
              {!loadingFields.username && duplicateErrors.username && (
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
              {!loadingFields.username && !duplicateErrors.username && validFields.username && (
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

              {/* 중복확인 버튼 */}
              <button
                type="button"
                onClick={handleCheckDuplicate}
                className="rounded bg-[#3c3c41] px-2 py-1 text-[11px] text-gray-300 hover:bg-[#505055] transition-colors whitespace-nowrap"
              >
                중복확인
              </button>
            </div>
          </div>

          {/* 비밀번호 섹션 (Row) */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <AuthInput
                type="password"
                id="password"
                label="비밀번호"
                maxLength={16}
                value={formData.password}
                onChange={handlePasswordChange}
                isError={!!errors.password}
                isValid={validFields.password && formData.password.length > 0}
                error={errors.password}
              />
            </div>
            <div className="flex-1">
              <AuthInput
                type="password"
                id="passwordConfirm"
                label="비밀번호 확인"
                maxLength={16}
                value={formData.passwordConfirm}
                onChange={handlePasswordConfirmChange}
                error={errors.passwordConfirm}
                isValid={
                  validFields.passwordConfirm &&
                  formData.passwordConfirm.length > 0
                }
              />
            </div>
          </div>

          {/* 소환사 정보 섹션 */}
          <SectionDivider label="소환사 정보" type="section-header" />

          {/* 라이엇 ID 섹션 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              라이엇 ID
            </label>
            <div className="flex gap-3">
              <div className="flex-[2]">
                <AuthInput
                  id="gameName"
                  label="소환사명"
                  maxLength={16}
                  value={formData.gameName}
                  onChange={handleGameNameChange}
                  onBlur={handleSummonerBlur}
                  error={errors.gameName}
                  isLoading={loadingFields.gameName}
                  isValid={
                    validFields.gameName &&
                    isSummonerChecked &&
                    !duplicateErrors.tagLine
                  }
                />
              </div>
              <div className="flex-1">
                <AuthInput
                  id="tagLine"
                  label="TAG"
                  maxLength={6}
                  value={formData.tagLine}
                  onChange={handleTagLineChange}
                  onBlur={handleSummonerBlur}
                  error={errors.tagLine}
                  isLoading={loadingFields.tagLine}
                  isError={duplicateErrors.tagLine}
                  isValid={
                    validFields.tagLine &&
                    isSummonerChecked &&
                    !duplicateErrors.tagLine
                  }
                />
              </div>
            </div>
          </div>

          {/* 포지션 선택 섹션 */}
          <div className="flex gap-3">
            {/* 주 포지션 */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-400">
                메인 포지션
              </label>
              <div className="flex justify-between gap-1 rounded-md border border-[#c8aa6e]/20 bg-gray-900/50 p-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={`main-${pos.id}`}
                    type="button"
                    onClick={() => setMainPosition(pos.id)}
                    className={`group relative flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-[#c8aa6e]/10 ${
                      mainPosition === pos.id
                        ? "bg-[#c8aa6e]/20 ring-1 ring-[#c8aa6e]"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={pos.icon}
                      alt={pos.label}
                      className="h-5 w-5 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 부 포지션 */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-400">
                서브 포지션
              </label>
              <div className="flex justify-between gap-1 rounded-md border border-[#c8aa6e]/20 bg-gray-900/50 p-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={`sub-${pos.id}`}
                    type="button"
                    onClick={() => setSubPosition(pos.id)}
                    className={`group relative flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-[#c8aa6e]/10 ${
                      subPosition === pos.id
                        ? "bg-[#c8aa6e]/20 ring-1 ring-[#c8aa6e]"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={pos.icon}
                      alt={pos.label}
                      className="h-5 w-5 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 티어 선택 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              티어
            </label>
            <div className="flex gap-3">
              <div
                className={
                  [
                    "IRON",
                    "BRONZE",
                    "SILVER",
                    "GOLD",
                    "PLATINUM",
                    "EMERALD",
                    "DIAMOND",
                  ].includes(tier)
                    ? "flex-[2] relative"
                    : "w-full relative"
                }
              >
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full appearance-none rounded border border-[#c8aa6e]/30 bg-gray-900/50 px-4 py-3 text-[#f0e6d2] placeholder-gray-500 focus:border-[#c8aa6e] focus:outline-none focus:ring-1 focus:ring-[#c8aa6e]"
                >
                  <option value="" disabled>
                    티어 선택
                  </option>
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-gray-900">
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {[
                "IRON",
                "BRONZE",
                "SILVER",
                "GOLD",
                "PLATINUM",
                "EMERALD",
                "DIAMOND",
              ].includes(tier) && (
                <div className="flex-1 relative">
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full appearance-none rounded border border-[#c8aa6e]/30 bg-gray-900/50 px-4 py-3 text-[#f0e6d2] placeholder-gray-500 focus:border-[#c8aa6e] focus:outline-none focus:ring-1 focus:ring-[#c8aa6e]"
                  >
                    <option value="1" className="bg-gray-900">
                      1
                    </option>
                    <option value="2" className="bg-gray-900">
                      2
                    </option>
                    <option value="3" className="bg-gray-900">
                      3
                    </option>
                    <option value="4" className="bg-gray-900">
                      4
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 가입 버튼 */}
          <div className="pt-2">
            <AuthButton
              variant="primary"
              onClick={handleApiSignup}
              disabled={isLoading}
            >
              {isLoading ? "가입 중..." : "가입 완료"}
            </AuthButton>
          </div>
        </div>

        {/* 푸터 링크 */}
        <FooterLinks>
          <span className="text-gray-400">이미 계정이 있으신가요?</span>
          <TextLink to="/login">로그인</TextLink>
        </FooterLinks>
      </div>
    </div>
  );
};

export default SignupPage;
