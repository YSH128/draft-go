import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

import useSignupForm from "../../hooks/useSignupForm";
import { POSITIONS } from "../../constants/riot";
import useAuthStore from "../../stores/useAuthStore";

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인된 사용자는 홈으로 리다이렉트 (뒤로가기 방지)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Layout State for new fields (Position/Tier)
  const [mainPosition, setMainPosition] = useState(null);
  const [subPosition, setSubPosition] = useState(null);

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
    handleUsernameBlur,
    handleSummonerBlur,
    isSummonerVerified,
  } = useSignupForm();

  const handleApiSignup = async () => {
    const isAllValid = Object.values(validFields).every(Boolean);

    if (!isAllValid) {
      alert("입력 정보를 다시 확인해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        username: formData.username,
        password: formData.password,
        gameName: formData.gameName,
        tagLine: formData.tagLine.replace(/^#/, ""),
        mainPosition,
        subPosition,
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
              onBlur={handleUsernameBlur}
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
              <div className="flex-[2] relative">
                <AuthInput
                  id="gameName"
                  label="소환사명"
                  maxLength={16}
                  value={formData.gameName}
                  onChange={handleGameNameChange}
                  onBlur={handleSummonerBlur}
                  error={errors.gameName}
                  isLoading={loadingFields.gameName}
                  isError={!!errors.gameName}
                  isValid={
                    validFields.gameName &&
                    isSummonerVerified &&
                    !errors.gameName
                  }
                  inputClassName="pr-[40px]"
                  hideStatusIcon={true}
                />
                <div className="absolute right-3 top-[21px] -translate-y-1/2 z-10 flex items-center gap-2">
                  {/* Status Icon for GameName */}
                  {loadingFields.gameName && (
                    <div className="w-[14px] h-[14px] border-2 border-[#3c3c41] border-t-[#2ecc71] rounded-full animate-spin" />
                  )}
                  {!loadingFields.gameName && !!errors.gameName && (
                    <div className="text-[#e84057]">
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                  )}
                  {!loadingFields.gameName && !errors.gameName && validFields.gameName && isSummonerVerified && (
                    <div className="text-[#2ecc71]">
                      <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 relative">
                <AuthInput
                  id="tagLine"
                  label="TAG"
                  maxLength={6}
                  value={formData.tagLine}
                  onChange={handleTagLineChange}
                  onBlur={handleSummonerBlur}
                  error={errors.tagLine}
                  isLoading={loadingFields.tagLine}
                  isError={!!errors.tagLine}
                  isValid={
                    validFields.tagLine &&
                    isSummonerVerified &&
                    !errors.tagLine
                  }
                  inputClassName="pr-[40px]"
                  hideStatusIcon={true}
                />
                <div className="absolute right-3 top-[21px] -translate-y-1/2 z-10 flex items-center gap-2">
                  {/* Status Icon for TagLine */}
                  {loadingFields.tagLine && (
                    <div className="w-[14px] h-[14px] border-2 border-[#3c3c41] border-t-[#2ecc71] rounded-full animate-spin" />
                  )}
                  {!loadingFields.tagLine && !!errors.tagLine && (
                    <div className="text-[#e84057]">
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                  )}
                  {!loadingFields.tagLine && !errors.tagLine && validFields.tagLine && isSummonerVerified && (
                    <div className="text-[#2ecc71]">
                      <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
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
                    className={`group relative flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-[#c8aa6e]/10 ${mainPosition === pos.id
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
                    className={`group relative flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-[#c8aa6e]/10 ${subPosition === pos.id
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



          {/* 가입 버튼 */}
          <div className="pt-2">
            <AuthButton
              variant="primary"
              onClick={handleApiSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" color="white" />
                  <span>가입 중...</span>
                </div>
              ) : (
                "가입 완료"
              )}
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
