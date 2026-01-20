import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";
import useSignupForm from "../../hooks/useSignupForm";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const navigate = useNavigate();
  // [Why] 로딩 상태 추가 - 중복 클릭 방지 및 UX 개선
  const [isLoading, setIsLoading] = useState(false);

  const {
    formData,
    passwordStrength,
    errors,
    loadingFields,
    duplicateErrors,
    handleUsernameChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleGameNameChange,
    handleTagLineChange,
    validFields,
  } = useSignupForm();

  const handleApiSignup = async () => {
    // [Why] isPasswordMatch 중복 검사 제거 - validFields.passwordConfirm이 이미 검사함
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
    <div className={styles.container}>
      <h1 className={styles.title}>회원가입</h1>

      <SectionDivider label="계정 정보" type="section-header" />

      <AuthInput
        id="username"
        label="아이디"
        value={formData.username}
        onChange={handleUsernameChange}
        error={errors.username}
        isLoading={loadingFields.username}
        isError={duplicateErrors.username}
        isValid={validFields.username}
      />

      <div className={styles.passwordSection}>
        <AuthInput
          type="password"
          id="password"
          label="비밀번호"
          maxLength={16}
          value={formData.password}
          onChange={handlePasswordChange}
          isError={!!errors.password || passwordStrength.type === "error"}
          isValid={validFields.password && formData.password.length > 0}
          hideErrorIcon
          className={`${styles.levelCommon} ${styles[`level${passwordStrength.level}`]}`}
          error={
            passwordStrength.type === "error"
              ? passwordStrength.text
              : errors.password
          }
          helperText={
            passwordStrength.type === "success" ? (
              <span className={styles.strengthText}>
                {passwordStrength.text}
              </span>
            ) : null
          }
        />
      </div>

      <AuthInput
        type="password"
        id="passwordConfirm"
        label="비밀번호 확인"
        maxLength={16}
        value={formData.passwordConfirm}
        onChange={handlePasswordConfirmChange}
        error={errors.passwordConfirm}
        isValid={validFields.passwordConfirm && formData.passwordConfirm.length > 0}
      />

      <SectionDivider label="소환사 정보" type="section-header" />

      <AuthInput
        id="gameName"
        label="소환사명"
        maxLength={16}
        value={formData.gameName}
        onChange={handleGameNameChange}
        error={errors.gameName}
        isValid={validFields.gameName}
      />

      <AuthInput
        id="tagLine"
        label="태그"
        maxLength={6}
        value={formData.tagLine}
        onChange={handleTagLineChange}
        error={errors.tagLine}
        isLoading={loadingFields.tagLine}
        isError={duplicateErrors.tagLine}
        isValid={validFields.tagLine}
      />

      <div className={styles.buttonWrapper}>
        <AuthButton
          variant="primary"
          onClick={handleApiSignup}
          disabled={isLoading}
        >
          {isLoading ? "가입 중..." : "가입하기"}
        </AuthButton>
      </div>

      <FooterLinks>
        <span>이미 계정이 있으신가요?</span>
        <TextLink to="/login">로그인</TextLink>
      </FooterLinks>
    </div>
  );
};

export default SignupPage;
