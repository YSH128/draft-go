import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import SectionDivider from "../../components/ui/SectionDivider";
import TextLink, { FooterLinks } from "../../components/ui/TextLink";
import useSignupForm from "../../hooks/useSignupForm";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const {
    formData,
    passwordStrength,
    errors,
    loadingFields,
    duplicateErrors,
    handleIdChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleNicknameChange,
    handleTagChange,
    handleSubmit,
    idRef,
    passwordRef,
    passwordConfirmRef,
    nicknameRef,
    tagRef,
    validFields,
  } = useSignupForm();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>회원가입</h1>

      {/* 계정 정보 */}
      <SectionDivider label="계정 정보" type="section-header" />

      <AuthInput
        ref={idRef}
        id="id"
        label="아이디"
        value={formData.id}
        onChange={handleIdChange}
        error={errors.id}
        isLoading={loadingFields.id}
        isError={duplicateErrors.id}
        isValid={validFields.id}
      />

      <div className={styles.passwordSection}>
        <AuthInput
          ref={passwordRef}
          type="password"
          id="password"
          label="비밀번호"
          maxLength={16}
          value={formData.password}
          onChange={handlePasswordChange}
          isError={!!errors.password || passwordStrength.type === "error"}
          isValid={validFields.password && formData.password.length > 0}
          hideErrorIcon={true}
          className={`${styles.levelCommon} ${styles[`level${passwordStrength.level}`]}`}
          error={
            passwordStrength.type === "error"
              ? passwordStrength.text
              : errors.password
          }
          helperText={
            passwordStrength.type === "success" ? (
              <span className={styles.strengthText}>{passwordStrength.text}</span>
            ) : null
          }
        />
      </div>

      <AuthInput
        ref={passwordConfirmRef}
        type="password"
        id="passwordConfirm"
        label="비밀번호 확인"
        maxLength={16}
        value={formData.passwordConfirm}
        onChange={handlePasswordConfirmChange}
        error={errors.passwordConfirm}
        isValid={validFields.passwordConfirm && formData.passwordConfirm.length > 0}
      />

      {/* 소환사 정보 */}
      <SectionDivider label="소환사 정보" type="section-header" />

      <AuthInput
        ref={nicknameRef}
        id="nickname"
        label="소환사명"
        maxLength={16}
        value={formData.nickname}
        onChange={handleNicknameChange}
        error={errors.nickname}
        isValid={validFields.nickname}
      />

      <AuthInput
        ref={tagRef}
        id="tag"
        label="태그"
        maxLength={6}
        value={formData.tag}
        onChange={handleTagChange}
        error={errors.tag}
        isLoading={loadingFields.tag}
        isError={duplicateErrors.tag}
        isValid={validFields.tag}
      />

      {/* 가입 버튼 */}
      <div className={styles.buttonWrapper}>
        <AuthButton variant="primary" onClick={handleSubmit}>
          가입하기
        </AuthButton>
      </div>

      {/* 푸터 링크 */}
      <FooterLinks>
        <span>이미 계정이 있으신가요?</span>
        <TextLink to="/login">로그인</TextLink>
      </FooterLinks>
    </div>
  );
};

export default SignupPage;
