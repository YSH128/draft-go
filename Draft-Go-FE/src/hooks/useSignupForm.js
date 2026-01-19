import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import useDebounce from "./useDebounce";

/**
 * 회원가입 폼 로직 커스텀 훅
 * Riot ID 표준 준수 유효성 검사
 */
const useSignupForm = () => {
  // ===== State =====
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    tag: "",
  });

  const [submitErrors, setSubmitErrors] = useState({});
  // ===== Derived State: 비밀번호 보안 강도 & 메시지 =====
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { level: 0, type: "none", text: "" };

    // 1. 유효성 검사 (Error Case)
    // 8~16자
    if (pw.length < 8 || pw.length > 16) {
      return { level: 1, type: "error", text: "8~16자" };
    }
    // 사용 불가 문자
    const allowedChars = /^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/;
    if (!allowedChars.test(pw)) {
      return { level: 1, type: "error", text: "사용 불가 문자 포함" };
    }
    // 영문+숫자 필수
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    if (!hasLetter || !hasNumber) {
      return { level: 1, type: "error", text: "영문+숫자 필수" };
    }

    // 2. 강도 계산 (Success Case)
    // 여기서는 이미 유효성(영문+숫자, 길이 등)은 통과한 상태
    const hasSpecial = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/.test(pw);
    
    // 특수문자 포함 시 레벨 3, 아니면 레벨 2 (영문+숫자는 위에서 보장됨)
    const level = hasSpecial ? 3 : 2;
    const text = level === 3 ? "보안 매우 높음" : "보안 높음";

    return { level, type: "success", text };
  }, [formData.password]);
  const [duplicateCheck, setDuplicateCheck] = useState({
    id: { checking: false, isDuplicate: null },
    nicknameTag: { checking: false, isDuplicate: null }, // 닉네임+태그 조합
  });

  // ===== Debounced Values =====
  const debouncedId = useDebounce(formData.id, 500);
  const debouncedNickname = useDebounce(formData.nickname, 500);
  const debouncedTag = useDebounce(formData.tag, 500);
  const debouncedPassword = useDebounce(formData.password, 500);
  const debouncedPasswordConfirm = useDebounce(formData.passwordConfirm, 500);

  // ===== Refs =====
  const idRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const nicknameRef = useRef(null);
  const tagRef = useRef(null);

  const refsMap = {
    id: idRef,
    password: passwordRef,
    passwordConfirm: passwordConfirmRef,
    nickname: nicknameRef,
    tag: tagRef,
  };

  // ===== API: 중복 체크 =====
  const checkDuplicate = useCallback(async (field, value, extraValue = null) => {
    const checkKey = field === "nicknameTag" ? "nicknameTag" : field;

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: true, isDuplicate: null },
    }));

    // TODO: 실제 API 호출로 대체
    await new Promise((resolve) => setTimeout(resolve, 600));

    let isDuplicate = false;

    if (field === "nicknameTag") {
      // 닉네임+태그 조합 중복 체크 (Mock)
      const mockCombinations = ["Player#KR1", "Faker#T1", "Hide#KR99"];
      const combination = `${value}#${extraValue?.replace("#", "")}`;
      isDuplicate = mockCombinations.includes(combination);
    } else {
      const mockDuplicates = {
        id: ["admin", "test", "user"],
      };
      isDuplicate = mockDuplicates[field]?.includes(value) || false;
    }

    setDuplicateCheck((prev) => ({
      ...prev,
      [checkKey]: { checking: false, isDuplicate },
    }));

    return isDuplicate;
  }, []);

  // ===== Validation: 아이디 =====
  const idValidation = useMemo(() => {
    if (!debouncedId) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    const isValidFormat = /^[a-zA-Z0-9]{4,20}$/.test(debouncedId);
    if (!isValidFormat) {
      return {
        isValid: false,
        error: "영문/숫자 4~20자",
        shouldCheck: false,
      };
    }
    if (duplicateCheck.id.isDuplicate) {
      return {
        isValid: false,
        error: "이미 사용 중인 아이디입니다.",
        shouldCheck: false,
      };
    }
    if (duplicateCheck.id.checking) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.id.isDuplicate === null) {
      return { isValid: false, error: "", shouldCheck: true };
    }
    return { isValid: true, error: "", shouldCheck: false };
  }, [debouncedId, duplicateCheck.id]);

  // ===== Validation: 비밀번호 =====
  const passwordValidation = useMemo(() => {
    if (!debouncedPassword) {
      return { isValid: false, error: "" };
    }
    const pw = debouncedPassword;
    const allowedChars = /^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);

    if (pw.length < 8 || pw.length > 16) {
      return { isValid: false, error: "8~16자" };
    }
    if (!allowedChars.test(pw)) {
      return { isValid: false, error: "사용 불가 문자 포함" };
    }
    if (!hasLetter || !hasNumber) {
      return { isValid: false, error: "영문+숫자 필수" };
    }
    return { isValid: true, error: "" };
  }, [debouncedPassword]);

  // ===== Validation: 비밀번호 확인 =====
  const passwordConfirmValidation = useMemo(() => {
    if (!debouncedPasswordConfirm) {
      return { isValid: false, error: "" };
    }
    if (debouncedPassword !== debouncedPasswordConfirm) {
      return { isValid: false, error: "비밀번호 불일치" };
    }
    return { isValid: true, error: "" };
  }, [debouncedPassword, debouncedPasswordConfirm]);

  // ===== Validation: 소환사명 (3~16자, 중복 허용) =====
  const nicknameValidation = useMemo(() => {
    if (!debouncedNickname) {
      return { isValid: false, error: "" };
    }

    // 길이 검사: 3~16자
    if (debouncedNickname.length < 3 || debouncedNickname.length > 16) {
      return {
        isValid: false,
        error: "3~16자",
      };
    }

    // 한글/영문/숫자/공백 허용
    if (!/^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]+$/.test(debouncedNickname)) {
      return {
        isValid: false,
        error: "한글/영문/숫자 허용",
      };
    }

    return { isValid: true, error: "" };
  }, [debouncedNickname]);

  // ===== Validation: 태그 (3~5자, 영숫자, 닉네임+태그 조합 중복 체크) =====
  const tagValidation = useMemo(() => {
    if (!debouncedTag) {
      return { isValid: false, error: "", shouldCheck: false };
    }

    // # 제거 후 검사
    const tagValue = debouncedTag.replace(/^#/, "");

    // 길이 검사: 3~5자 (정확히)
    if (tagValue.length < 3 || tagValue.length > 5) {
      return {
        isValid: false,
        error: "3~5자",
        shouldCheck: false,
      };
    }

    // 한글/영문/숫자 허용
    if (!/^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(tagValue)) {
      return {
        isValid: false,
        error: "한글/영문/숫자만",
        shouldCheck: false,
      };
    }

    // 닉네임도 유효해야 조합 중복 체크 진행
    if (!debouncedNickname || debouncedNickname.length < 3 || !nicknameValidation.isValid) {
      return { isValid: false, error: "", shouldCheck: false };
    }

    if (duplicateCheck.nicknameTag.isDuplicate) {
      return {
        isValid: false,
        error: "이미 사용 중인 조합",
        shouldCheck: false,
      };
    }
    if (duplicateCheck.nicknameTag.checking) {
      return { isValid: false, error: "", shouldCheck: false };
    }
    if (duplicateCheck.nicknameTag.isDuplicate === null && nicknameValidation.isValid) {
      return { isValid: false, error: "", shouldCheck: true };
    }
    if (nicknameValidation.isValid && duplicateCheck.nicknameTag.isDuplicate === false) {
      return { isValid: true, error: "", shouldCheck: false };
    }
    return { isValid: false, error: "", shouldCheck: false };
  }, [debouncedTag, debouncedNickname, duplicateCheck.nicknameTag, nicknameValidation.isValid]);

  // ===== 중복 체크 자동 트리거 =====
  useEffect(() => {
    if (idValidation.shouldCheck) {
      checkDuplicate("id", debouncedId);
    }
  }, [idValidation.shouldCheck, debouncedId, checkDuplicate]);


  // 닉네임+태그 조합 중복 체크
  useEffect(() => {
    if (tagValidation.shouldCheck && nicknameValidation.isValid) {
      const tagValue = debouncedTag.replace(/^#/, "");
      checkDuplicate("nicknameTag", debouncedNickname, tagValue);
    }
  }, [tagValidation.shouldCheck, nicknameValidation.isValid, debouncedNickname, debouncedTag, checkDuplicate]);

  // ===== 통합 에러/유효성 상태 =====
  const errors = {
    id: submitErrors.id || idValidation.error || "",
    password: passwordValidation.error || submitErrors.password || "",
    passwordConfirm: passwordConfirmValidation.error || submitErrors.passwordConfirm || "",
    nickname: nicknameValidation.error || submitErrors.nickname || "",
    tag: tagValidation.error || submitErrors.tag || "",
  };

  const validFields = {
    id: idValidation.isValid,
    password: passwordValidation.isValid,
    passwordConfirm: passwordConfirmValidation.isValid,
    nickname: nicknameValidation.isValid,
    tag: tagValidation.isValid,
  };

  const loadingFields = {
    id: duplicateCheck.id.checking,
    tag: duplicateCheck.nicknameTag.checking,
  };

  const duplicateErrors = {
    id: duplicateCheck.id.isDuplicate === true,
    tag: duplicateCheck.nicknameTag.isDuplicate === true,
  };

  // ===== Handlers =====
  const handleIdChange = (e) => {
    const rawValue = e.target.value;
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(rawValue);
    const value = rawValue.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "");

    setFormData((prev) => ({ ...prev, id: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      id: { checking: false, isDuplicate: null },
    }));

    if (hasKorean) {
      setSubmitErrors((prev) => ({ ...prev, id: "한글은 입력할 수 없습니다." }));
    } else {
      if (submitErrors.id) setSubmitErrors((prev) => ({ ...prev, id: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    if (submitErrors.password) setSubmitErrors((prev) => ({ ...prev, password: "" }));
  };

  const handlePasswordConfirmChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, passwordConfirm: value }));
    if (submitErrors.passwordConfirm) {
      setSubmitErrors((prev) => ({ ...prev, passwordConfirm: "" }));
    }
  };

  const handleNicknameChange = (e) => {
    // 한글/영문/숫자/공백 허용
    const value = e.target.value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "");
    setFormData((prev) => ({ ...prev, nickname: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      nicknameTag: { checking: false, isDuplicate: null },
    }));
    if (submitErrors.nickname) setSubmitErrors((prev) => ({ ...prev, nickname: "" }));
  };

  const handleTagChange = (e) => {
    let value = e.target.value;

    // # 제외하고 한글/영문/숫자 허용
    const cleanValue = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣#]/g, "");

    // # 제거 후 순수 태그 값만 추출
    const tagContent = cleanValue.replace(/^#+/, "");

    // 입력값이 있으면 항상 # 접두사 유지
    if (tagContent.length > 0) {
      value = "#" + tagContent;
    } else {
      value = "";
    }

    setFormData((prev) => ({ ...prev, tag: value }));
    setDuplicateCheck((prev) => ({
      ...prev,
      nicknameTag: { checking: false, isDuplicate: null },
    }));
    if (submitErrors.tag) setSubmitErrors((prev) => ({ ...prev, tag: "" }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    let firstErrorKey = null;

    const validations = [
      { key: "id", emptyMsg: "아이디를 입력해주세요.", invalidMsg: "아이디를 확인해주세요." },
      { key: "password", emptyMsg: "비밀번호를 입력해주세요.", invalidMsg: "비밀번호를 확인해주세요." },
      { key: "passwordConfirm", emptyMsg: "비밀번호 확인을 입력해주세요.", invalidMsg: "비밀번호가 일치하지 않습니다." },
      { key: "nickname", emptyMsg: "소환사명을 입력해주세요.", invalidMsg: "소환사명을 확인해주세요." },
      { key: "tag", emptyMsg: "태그를 입력해주세요.", invalidMsg: "태그를 확인해주세요." },
    ];

    validations.forEach(({ key, emptyMsg, invalidMsg }) => {
      if (!formData[key]?.trim()) {
        newErrors[key] = emptyMsg;
        if (!firstErrorKey) firstErrorKey = key;
      } else if (!validFields[key]) {
        newErrors[key] = invalidMsg;
        if (!firstErrorKey) firstErrorKey = key;
      }
    });

    setSubmitErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      refsMap[firstErrorKey]?.current?.focus();
      return false;
    }

    console.log("회원가입 성공:", formData);
    return true;
  };

  return {
    formData,
    passwordStrength,
    errors,
    validFields,
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
  };
};

export default useSignupForm;
