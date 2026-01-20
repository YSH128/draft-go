import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks, LinkSeparator } from "../../components/ui/TextLink";
import riotIcon from "../../assets/riot-logo.png";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login(formData);
      localStorage.setItem("accessToken", response.accessToken);
      navigate("/");
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DRAFT GO</h1>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <AuthInput
        id="username"
        label="아이디"
        value={formData.username}
        onChange={handleChange}
      />

      <AuthInput
        type="password"
        id="password"
        label="비밀번호"
        value={formData.password}
        onChange={handleChange}
      />

      <div className={styles.buttonWrapper}>
        <AuthButton variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </AuthButton>
      </div>

      <FooterLinks>
        <TextLink to="/find" variant="muted">
          아이디/비밀번호 찾기
        </TextLink>
        <LinkSeparator />
        <TextLink to="/signup" variant="muted">
          회원가입
        </TextLink>
      </FooterLinks>

      <SectionDivider label="또는" type="center-line" />

      <AuthButton variant="riot" icon={<img src={riotIcon} alt="Riot" />}>
        Riot 계정으로 시작
      </AuthButton>
    </div>
  );
};

export default LoginPage;
