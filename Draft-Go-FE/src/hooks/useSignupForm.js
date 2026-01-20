import { useState, useMemo, useCallback, useEffect } from "react";
import useDebounce from "./useDebounce";

// [Why] 정규식을 상수로 분리하여 매 렌더링마다 재생성되는 것을 방지
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

// [Why] 비밀번호 검증 로직을 함수로 분리하여 passwordStrength와 passwordValidation에서 재사용
const validatePassword = (pw) => {
  if (!pw) return { isValid: false, error: "", level: 0, type: "none", text: "" };

  if (pw.length < 8 || pw.length > 16) {
    return { isValid: false, error: "8~16자", level: 1, type: "error", text: "8~16자" };
  }
  if (!REGEX.PASSWORD_ALLOWED.test(pw)) {
    return { isValid: false, error: "사용 불가 문자 포함", level: 1, type: "error", text: "사용 불가 문자 포함" };
  }
  if (!REGEX.PASSWORD_LETTER.test(pw) || !REGEX.PASSWORD_NUMBER.test(pw)) {
    return { isValid: false, error: "영문+숫자 필수", level: 1, type: "error", text: "영문+숫자 필수" };
  }

  // 유효한 경우 강도 계산
  const hasSpecial = REGEX.PASSWORD_SPECIAL.test(pw);
  const level = hasSpecial ? 3 : 2;
  const text = level === 3 ? "보안 매우 높음" : "보안 높음";

  return { isValid: true, error: "", level, type: "success", text };
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

  // [Why] submitErrors를 제거하고 koreanError로 단순화 (실제로 한글 에러만 사용됨)
  const [koreanError, setKoreanError] = useState("");

  const [duplicateCheck, setDuplicateCheck] = useState({
    username: { checking: false, isDuplicate: null },
    gameNameTagLine: { checking: false, isDuplicate: null },
  });

  // [Why] password, passwordConfirm은 debounce 불필요 - 즉시 검증해도 성능 영향 없음
  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedGameName = useDebounce(formData.gameName, 500);
  const debouncedTagLine = useDebounce(formData.tagLine, 500);

  // ===== 비밀번호 검증 (통합) =====
  // [Why] passwordStrength와 passwordValidation을 하나로 통합
  const passwordResult = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  const passwordStrength = {
    level: passwordResult.level,
    type: passwordResult.type,
    text: passwordResult.text,
  };

  // ===== API: 중복 체크 =====
  const checkDuplicate = useCallback(async (field, value, extraValue = null) => {
    const checkKey = field === "gameNameTagLine" ? "gameNameTagLine" : field;

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: true, isDuplicate: null },
    }));

    // TODO: 실제 API 호출로 대체
    await new Promise((resolve) => setTimeout(resolve, 600));

    let isDuplicate = false;

    if (field === "gameNameTagLine") {
      const mockCombinations = ["Player#KR1", "Faker#T1", "Hide#KR99"];
      const combination = `${value}#${extraValue?.replace("#", "")}`;
      isDuplicate = mockCombinations.includes(combination);
    } else {
      const mockDuplicates = { username: ["admin", "test", "user"] };
      isDuplicate = mockDuplicates[field]?.includes(value) || false;
    }

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: false, isDuplicate },
    }));

    return isDuplicate;
  }, []);

  // ===== Validation: 아이디 =====
  const usernameValidation = useMemo(() => {
    if (!debouncedUsername) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (!REGEX.USERNAME.test(debouncedUsername)) {
      return { isValid: false, error: "영문/숫자 4~20자", shouldCheck: false };
    }
    if (duplicateCheck.username.isDuplicate) {
      return { isValid: false, error: "이미 사용 중인 아이디입니다.", shouldCheck: false };
    }
    if (duplicateCheck.username.checking) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.username.isDuplicate === null) {
      return { isValid: false, error: "", shouldCheck: true };
    }
    return { isValid: true, error: "", shouldCheck: false };
  }, [debouncedUsername, duplicateCheck.username]);

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
    if (!debouncedGameName) {
      return { isValid: false, error: "" };
    }
    if (debouncedGameName.length < 3 || debouncedGameName.length > 16) {
      return { isValid: false, error: "3~16자" };
    }
    if (!REGEX.GAME_NAME.test(debouncedGameName)) {
      return { isValid: false, error: "한글/영문/숫자 허용" };
    }
    return { isValid: true, error: "" };
  }, [debouncedGameName]);

  // ===== Validation: 태그 =====
  const tagLineValidation = useMemo(() => {
    if (!debouncedTagLine) {
      return { isValid: false, error: "", shouldCheck: false };
    }

    const tagValue = debouncedTagLine.replace(/^#/, "");

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
      return { isValid: false, error: "이미 사용 중인 조합", shouldCheck: false };
    }
    if (duplicateCheck.gameNameTagLine.checking) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.gameNameTagLine.isDuplicate === null) {
      return { isValid: false, error: "", shouldCheck: true };
    }
    return { isValid: true, error: "", shouldCheck: false };
  }, [debouncedTagLine, duplicateCheck.gameNameTagLine, gameNameValidation.isValid]);

  // ===== 중복 체크 자동 트리거 =====
  useEffect(() => {
    if (usernameValidation.shouldCheck) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkDuplicate("username", debouncedUsername);
    }
  }, [usernameValidation.shouldCheck, debouncedUsername, checkDuplicate]);

  useEffect(() => {
    if (tagLineValidation.shouldCheck && gameNameValidation.isValid) {
      const tagValue = debouncedTagLine.replace(/^#/, "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkDuplicate("gameNameTagLine", debouncedGameName, tagValue);
    }
  }, [
    tagLineValidation.shouldCheck,
    gameNameValidation.isValid,
    debouncedGameName,
    debouncedTagLine,
    checkDuplicate,
  ]);

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
  };

  const duplicateErrors = {
    username: duplicateCheck.username.isDuplicate === true,
    tagLine: duplicateCheck.gameNameTagLine.isDuplicate === true,
  };

  // ===== Handlers =====
  // [Why] useCallback 제거 - 자식 컴포넌트가 React.memo를 사용하지 않으면 불필요
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

  return {
    formData,
    passwordStrength,
    errors,
    validFields,
    loadingFields,
    duplicateErrors,
    handleUsernameChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleGameNameChange,
    handleTagLineChange,
  };
};

export default useSignupForm;
