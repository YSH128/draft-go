import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMyProfile } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import riotIcon from "../../assets/images/riot-logo.png";
import logo from "../../assets/logo/draft-go-logo.png";
import useAuthStore from "../../stores/useAuthStore";
import AlertModal from "../../components/ui/AlertModal";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login: loginAction } = useAuthStore();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRiotModalOpen, setIsRiotModalOpen] = useState(false);

  // 이미 로그인된 사용자는 홈으로 리다이렉트 (뒤로가기 방지)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
  };

  const handleRiotLogin = () => {
    setIsRiotModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login(formData);
      // 먼저 토큰 저장 (me API 호출 시 인증 헤더에 필요)
      loginAction(response.accessToken);

      // 사용자 정보 조회하여 role 포함하여 저장
      try {
        const userInfo = await getMyProfile();
        loginAction(response.accessToken, {
          id: userInfo.memberId,
          username: userInfo.username,
          gameName: userInfo.gameName,
          tagLine: userInfo.tagLine,
          profileIconUrl: userInfo.profileIconUrl,
          role: userInfo.role,
        });
      } catch (profileError) {
        console.error("프로필 로드 실패:", profileError);
      }

      window.location.href = "/";
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-950 px-4 pt-16">
      <div className="h-fit w-full max-w-[420px] rounded-lg border border-[#c8aa6e]/30 bg-gray-900/80 p-8 shadow-xl backdrop-blur-sm">
        {/* 타이틀 -> 로고 이미지 교체 */}
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="Draft-GO" className="h-[100px] w-auto drop-shadow-[0_0_2px_#c89b3c]" />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="mb-4 rounded bg-red-500/10 px-3 py-2 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* 아이디 */}
          <AuthInput
            id="username"
            label="아이디"
            value={formData.username}
            onChange={handleChange}
          />

          {/* 비밀번호 */}
          <AuthInput
            type="password"
            id="password"
            label="비밀번호"
            value={formData.password}
            onChange={handleChange}
          />

          {/* 로그인 버튼 */}
          <div className="mt-5">
            <AuthButton
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" color="white" />
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </AuthButton>
          </div>
        </form>


        {/* 링크 모음 */}
        <FooterLinks>
          <TextLink to="/signup" variant="muted">
            회원가입
          </TextLink>
        </FooterLinks>

        {/* 구분선 */}
        <SectionDivider label="또는" type="center-line" />

        {/* 라이엇 로그인 버튼 */}
        <AuthButton 
          variant="riot" 
          icon={<img src={riotIcon} alt="Riot" />}
          onClick={handleRiotLogin}
        >
          Riot 계정으로 시작
        </AuthButton>
      </div>

      <AlertModal
        isOpen={isRiotModalOpen}
        onClose={() => setIsRiotModalOpen(false)}
        title="서비스 준비중"
        message="현재 준비중인 서비스입니다."
        icon="construction"
        variant="warning"
      />
    </div>
  );
};

export default LoginPage;
