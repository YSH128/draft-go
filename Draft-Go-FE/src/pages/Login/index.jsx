import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMyProfile } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";
import riotIcon from "../../assets/images/riot-logo.png";
import logo from "../../assets/logo/draft-go-logo.png";
import useAuthStore from "../../stores/useAuthStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
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
      
      // 사용자 정보 조회 후 저장
      try {
        const userInfo = await getMyProfile();
        loginAction(response.accessToken, {
          id: userInfo.memberId,
          username: userInfo.username,
          gameName: userInfo.gameName,
          tagLine: userInfo.tagLine,
        });
      } catch (profileError) {
        console.warn("프로필 조회 실패, 토큰만 저장됨:", profileError);
      }
      
      navigate("/");
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
              {isLoading ? "로그인 중..." : "로그인"}
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
        <AuthButton variant="riot" icon={<img src={riotIcon} alt="Riot" />}>
          Riot 계정으로 시작
        </AuthButton>
      </div>
    </div>
  );
};

export default LoginPage;
