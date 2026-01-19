import { useState } from "react";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks, LinkSeparator } from "../../components/ui/TextLink";
import riotIcon from "../../assets/riot-logo.png";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log("로그인 시도:", formData);
    // TODO: 로그인 API 호출
  };

  return (
    <div className={styles.container}>
      {/* 타이틀 */}
      <h1 className={styles.title}>DRAFT GO</h1>

      {/* 아이디 */}
      <AuthInput
        id="id"
        label="아이디"
        value={formData.id}
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
      <div className={styles.buttonWrapper}>
        <AuthButton variant="primary" onClick={handleSubmit}>
          로그인
        </AuthButton>
      </div>

      {/* 링크 모음 */}
      <FooterLinks>
        <TextLink to="/find" variant="muted">
          아이디/비밀번호 찾기
        </TextLink>
        <LinkSeparator />
        <TextLink to="/signup" variant="muted">
          회원가입
        </TextLink>
      </FooterLinks>

      {/* 구분선 */}
      <SectionDivider label="또는" type="center-line" />

      {/* 라이엇 로그인/회원가입 버튼 */}
      <AuthButton
        variant="riot"
        icon={<img src={riotIcon} alt="Riot" />}
      >
        Riot 계정으로 시작
      </AuthButton>
    </div>
  );
};

export default LoginPage;
