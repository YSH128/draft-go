import { useState, useMemo, useCallback } from "react";
import { checkUsernameDuplicate, checkSummonerDuplicate } from "../api/auth";

// 정규식을 상수로 분리하여 매 렌더링마다 재생성되는 것을 방지
const REGEX = {
  USERNAME: /^[a-zA-Z0-9]{4,20}$/,
  PASSWORD_ALLOWED: /^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/,
  PASSWORD_LETTER: /[a-zA-Z]/,
  PASSWORD_NUMBER: /[0-9]/,
  PASSWORD_SPECIAL: /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/,
  GAME_NAME: /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]+$/,
  TAG_LINE: /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+$/,
  KOREAN: /[ㄱ-ㅎㅏ-ㅣ가-힣]/g,
  GAME_NAME_FILTER: /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]/g,
  TAG_LINE_FILTER: /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣#]/g,
};

// 비밀번호 검증 로직을 함수로 분리하여 passwordStrength와 passwordValidation에서 재사용
const validatePassword = (pw) => {
  if (!pw) return { isValid: false, error: "" };

  if (pw.length < 8 || pw.length > 16) {
    return { isValid: false, error: "8~16자" };
  }
  if (!REGEX.PASSWORD_ALLOWED.test(pw)) {
    return { isValid: false, error: "사용 불가 문자 포함" };
  }
  if (!REGEX.PASSWORD_LETTER.test(pw) || !REGEX.PASSWORD_NUMBER.test(pw)) {
    return { isValid: false, error: "영문+숫자 필수" };
  }

  return { isValid: true, error: "" };
};

/**
 * 회원가입 폼 로직 커스텀 훅
 */
const useSignupForm = () => {
  // ===== State =====
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    gameName: "",
    tagLine: "",
  });

  // submitErrors를 제거하고 koreanError로 단순화 (실제로 한글 에러만 사용됨)
  const [koreanError, setKoreanError] = useState("");

  const [duplicateCheck, setDuplicateCheck] = useState({
    username: { checking: false, isDuplicate: null },
    gameNameTagLine: { checking: false, isDuplicate: null },
  });

  // 비밀번호 검증 (통합)
  // passwordStrength와 passwordValidation을 하나로 통합
  const passwordResult = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  // ===== API: 중복 체크 =====
  const checkDuplicate = useCallback(async (field, value, extraValue = null) => {
    const checkKey = field === "gameNameTagLine" ? "gameNameTagLine" : field;

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: true, isDuplicate: null },
    }));

    let isDuplicate = false;

    try {
      if (field === "username") {
        const response = await checkUsernameDuplicate(value);
        isDuplicate = response.isDuplicate;
      } else if (field === "gameNameTagLine") {
         const response = await checkSummonerDuplicate(value, extraValue);
         isDuplicate = response.isDuplicate;
      }
    } catch (error) {
      console.error(error);
      // 에러 발생 시 처리 (여기선 일단 넘어감)
    }

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: false, isDuplicate },
    }));

    return isDuplicate;
  }, []);

  // ===== Validation: 아이디 =====
  const usernameValidation = useMemo(() => {
    if (!formData.username) {
      return { isValid: false, error: "" };
    }
    if (!REGEX.USERNAME.test(formData.username)) {
      return { isValid: false, error: "영문/숫자 4~20자" };
    }
    if (duplicateCheck.username.isDuplicate) {
      return { isValid: false, error: "이미 사용 중인 아이디입니다." };
    }
    if (duplicateCheck.username.checking) {
      return { isValid: false, error: "" };
    }
    if (duplicateCheck.username.isDuplicate === null) {
      return { isValid: false, error: "" };
    }
    return { isValid: true, error: "" };
  }, [formData.username, duplicateCheck.username]);

  // ===== Validation: 비밀번호 확인 =====
  const passwordConfirmValidation = useMemo(() => {
    if (!formData.passwordConfirm) {
      return { isValid: false, error: "" };
    }
    if (formData.password !== formData.passwordConfirm) {
      return { isValid: false, error: "비밀번호 불일치" };
    }
    return { isValid: true, error: "" };
  }, [formData.password, formData.passwordConfirm]);

  // ===== Validation: 소환사명 =====
  const gameNameValidation = useMemo(() => {
    if (!formData.gameName) {
      return { isValid: false, error: "" };
    }
    if (formData.gameName.length < 2 || formData.gameName.length > 16) {
      return { isValid: false, error: "2~16자" };
    }
    if (!REGEX.GAME_NAME.test(formData.gameName)) {
      return { isValid: false, error: "한글/영문/숫자 허용" };
    }
    return { isValid: true, error: "" };
  }, [formData.gameName]);

  // ===== Validation: 태그 =====
  const tagLineValidation = useMemo(() => {
    if (!formData.tagLine) {
      return { isValid: false, error: "", shouldCheck: false };
    }

    const tagValue = formData.tagLine.replace(/^#/, "");

    if (tagValue.length < 3 || tagValue.length > 5) {
      return { isValid: false, error: "3~5자", shouldCheck: false };
    }
    if (!REGEX.TAG_LINE.test(tagValue)) {
      return { isValid: false, error: "한글/영문/숫자만", shouldCheck: false };
    }
    if (!gameNameValidation.isValid) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.gameNameTagLine.isDuplicate) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.gameNameTagLine.checking) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    return { isValid: true, error: "", shouldCheck: false };
  }, [formData.tagLine, duplicateCheck.gameNameTagLine, gameNameValidation.isValid]);

  // ===== 통합 에러/유효성 상태 =====
  const errors = {
    username: koreanError || usernameValidation.error,
    password: passwordResult.error,
    passwordConfirm: passwordConfirmValidation.error,
    gameName: gameNameValidation.error,
    tagLine: tagLineValidation.error,
  };

  const validFields = {
    username: usernameValidation.isValid,
    password: passwordResult.isValid,
    passwordConfirm: passwordConfirmValidation.isValid,
    gameName: gameNameValidation.isValid,
    tagLine: tagLineValidation.isValid,
  };

  const loadingFields = {
    username: duplicateCheck.username.checking,
    tagLine: duplicateCheck.gameNameTagLine.checking,
    gameName: duplicateCheck.gameNameTagLine.checking,
  };

  const duplicateErrors = {
    username: duplicateCheck.username.isDuplicate === true,
    tagLine: duplicateCheck.gameNameTagLine.isDuplicate === true,
  };

  const isUsernameChecked = duplicateCheck.username.isDuplicate !== null;
  const isSummonerChecked = duplicateCheck.gameNameTagLine.isDuplicate !== null;

  // ===== Handlers =====
  const handleUsernameChange = (e) => {
    const rawValue = e.target.value;
    const hasKorean = REGEX.KOREAN.test(rawValue);
    const value = rawValue.replace(REGEX.KOREAN, "");

    setFormData((prev) => ({ ...prev, username: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      username: { checking: false, isDuplicate: null },
    }));
    setKoreanError(hasKorean ? "한글은 입력할 수 없습니다." : "");
  };

  const handlePasswordChange = (e) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handlePasswordConfirmChange = (e) => {
    setFormData((prev) => ({ ...prev, passwordConfirm: e.target.value }));
  };

  const handleGameNameChange = (e) => {
    const value = e.target.value.replace(REGEX.GAME_NAME_FILTER, "");
    setFormData((prev) => ({ ...prev, gameName: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      gameNameTagLine: { checking: false, isDuplicate: null },
    }));
  };

  const handleTagLineChange = (e) => {
    const cleanValue = e.target.value.replace(REGEX.TAG_LINE_FILTER, "");
    const tagContent = cleanValue.replace(/^#+/, "");
    const value = tagContent.length > 0 ? "#" + tagContent : "";

    setFormData((prev) => ({ ...prev, tagLine: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      gameNameTagLine: { checking: false, isDuplicate: null },
    }));
  };

  const handleCheckDuplicate = async () => {
    if (!formData.username || !REGEX.USERNAME.test(formData.username)) {
      alert("아이디를 올바르게 입력해주세요.");
      return;
    }
    await checkDuplicate("username", formData.username);
  };

  const handleSummonerBlur = async () => {
    const { gameName, tagLine } = formData;
    const tagValue = tagLine.replace(/^#/, "");

    // 두 필드 값이 모두 있고, 포맷 검사를 통과했을 때만 호출
    if (gameName && tagValue && gameNameValidation.isValid && tagLineValidation.isValid) {
      // 이미 체크 중이거나 이미 체크했는데 값이 안 변했다면 패스? (값 변화는 handleChange에서 초기화됨)
      // 그냥 호출
      await checkDuplicate("gameNameTagLine", gameName, tagValue);
    }
  };

  return {
    formData,
    errors,
    validFields,
    loadingFields,
    duplicateErrors,
    isUsernameChecked,
    isSummonerChecked,
    handleUsernameChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleGameNameChange,
    handleTagLineChange,
    handleCheckDuplicate,
    handleSummonerBlur,
  };
};

export default useSignupForm;
