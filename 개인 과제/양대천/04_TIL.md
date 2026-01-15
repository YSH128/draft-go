# Day 4: React 프로젝트 구조 및 Hooks 심화 (2026-01-15)

## 1. React 프로젝트 폴더 구조

### 체계적인 폴더 관리의 필요성

프로젝트 규모가 커질수록 파일을 찾고 관리하기 어려워진다. 역할별로 폴더를 분리하면 코드의 가독성과 유지보수성이 크게 향상된다.

### 권장 폴더 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── layouts/        # 페이지 레이아웃 컴포넌트
├── hooks/          # 커스텀 훅
├── pages/          # 라우팅되는 페이지 컴포넌트
├── assets/         # 이미지, 폰트 등 정적 자원
├── utils/          # 유틸리티 함수
├── services/       # API 호출 관련
├── App.jsx
└── main.jsx
```

### 각 폴더의 역할

| 폴더 | 역할 | 예시 |
|------|------|------|
| **components** | 재사용 가능한 UI 요소 | Button, Input, Card, Modal |
| **layouts** | 페이지 공통 레이아웃 | Header, Footer, Sidebar 포함 구조 |
| **hooks** | 커스텀 훅 | useSignupForm, useDebounce |
| **pages** | 라우팅 대상 페이지 | LoginPage, SignupPage, HomePage |

### 분리하는 이유

1. **관심사 분리**: 각 파일이 하나의 역할만 담당
2. **재사용성**: 컴포넌트와 훅을 여러 곳에서 활용
3. **협업 용이**: 팀원이 파일을 빠르게 찾을 수 있음
4. **테스트 용이**: 독립적인 단위로 테스트 가능

---

## 2. React Router - URL 연동

### React Router란?

SPA(Single Page Application)에서 URL에 따라 다른 컴포넌트를 렌더링하게 해주는 라이브러리

### 설치

```bash
npm install react-router-dom
```

### 기본 설정 (main.jsx)

```javascript
import { BrowserRouter } from "react-router-dom";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 라우트 정의 (App.jsx)

```javascript
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
```

### 주요 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `<BrowserRouter>` | HTML5 History API를 사용한 라우터 |
| `<Routes>` | Route들을 감싸는 컨테이너 |
| `<Route>` | path와 element를 매핑 |
| `<Link>` | 페이지 이동 링크 (a 태그 대신 사용) |
| `<Navigate>` | 프로그래밍 방식 리다이렉트 |

### 페이지 이동 방법

```javascript
// 선언적 방식 - Link 컴포넌트
import { Link } from "react-router-dom";
<Link to="/login">로그인</Link>

// 프로그래밍 방식 - useNavigate 훅
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/login");
```

---

## 3. 커스텀 훅 (Custom Hook)

### 커스텀 훅이란?

React의 내장 훅들을 조합하여 만든 재사용 가능한 로직 단위. `use`로 시작하는 함수명을 사용한다.

### 커스텀 훅을 만드는 이유

1. **로직 재사용**: 여러 컴포넌트에서 동일한 로직 공유
2. **관심사 분리**: UI와 비즈니스 로직 분리
3. **테스트 용이성**: 로직만 독립적으로 테스트 가능
4. **코드 가독성**: 컴포넌트가 깔끔해짐

### 예시: useDebounce

```javascript
import { useState, useEffect } from "react";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
```

### 예시: useSignupForm (실습 코드)

```javascript
const useSignupForm = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    nickname: "",
  });

  // 유효성 검사 로직 (useMemo로 최적화)
  const idValidation = useMemo(() => {
    // 검사 로직...
  }, [formData.id]);

  // 핸들러 함수들 (useCallback으로 최적화)
  const handleIdChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, id: e.target.value }));
  }, []);

  return { formData, idValidation, handleIdChange, ... };
};
```

### 컴포넌트에서 사용

```javascript
function SignupPage() {
  const { formData, errors, handleIdChange, handleSubmit } = useSignupForm();

  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.id} onChange={handleIdChange} />
      {errors.id && <span>{errors.id}</span>}
    </form>
  );
}
```

---

## 4. React Hooks 복습 및 심화

### useState - 상태 관리

```javascript
const [state, setState] = useState(initialValue);

// 함수형 업데이트 (이전 상태 기반)
setState(prev => prev + 1);

// 객체 상태 업데이트
setState(prev => ({ ...prev, name: "새값" }));
```

### useRef - DOM 참조 및 값 유지

```javascript
// DOM 참조
const inputRef = useRef(null);
inputRef.current.focus();

// 렌더링에 영향 없는 값 저장
const countRef = useRef(0);
countRef.current += 1; // 리렌더링 발생 안함
```

**useState vs useRef**
- useState: 값 변경 시 리렌더링 발생
- useRef: 값 변경 시 리렌더링 발생 안함

### useMemo - 연산 결과 메모이제이션

```javascript
const expensiveResult = useMemo(() => {
  return heavyCalculation(data);
}, [data]); // data가 변경될 때만 재계산
```

**사용 시점**
- 복잡한 계산이 매 렌더링마다 실행될 때
- 배열 필터링/정렬 등 비용이 큰 연산

---

## 5. useCallback - 함수 메모이제이션

### useCallback이란?

함수를 메모이제이션하여 불필요한 재생성을 방지하는 Hook

### 기본 문법

```javascript
const memoizedFn = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // 의존성이 변경될 때만 함수 재생성
```

### 왜 필요한가?

컴포넌트가 리렌더링될 때마다 내부 함수는 새로 생성된다. 이 함수를 자식 컴포넌트에 props로 전달하면, 자식도 불필요하게 리렌더링된다.

```javascript
// useCallback 없이
function Parent() {
  const handleClick = () => { ... }; // 매번 새 함수 생성
  return <Child onClick={handleClick} />; // Child 매번 리렌더링
}

// useCallback 사용
function Parent() {
  const handleClick = useCallback(() => { ... }, []);
  return <Child onClick={handleClick} />; // Child 리렌더링 방지
}
```

### useMemo vs useCallback

```javascript
// 동일한 결과
const memoizedFn = useMemo(() => () => doSomething(), []);
const memoizedFn = useCallback(() => doSomething(), []);
```

- **useMemo**: 값(연산 결과)을 메모이제이션
- **useCallback**: 함수를 메모이제이션

---

## 6. useEffect - 사이드 이펙트 처리

### useEffect란?

컴포넌트의 생명주기에 따라 부수 효과(Side Effect)를 처리하는 Hook

### 기본 문법

```javascript
useEffect(() => {
  // 실행할 코드 (effect)

  return () => {
    // 정리 코드 (cleanup) - 선택사항
  };
}, [dependencies]); // 의존성 배열
```

### 의존성 배열에 따른 동작

```javascript
// 1. 매 렌더링마다 실행
useEffect(() => {
  console.log("렌더링됨");
});

// 2. 마운트 시 1회만 실행
useEffect(() => {
  console.log("마운트됨");
}, []);

// 3. 특정 값 변경 시 실행
useEffect(() => {
  console.log("count 변경됨:", count);
}, [count]);
```

### Cleanup 함수

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log("틱");
  }, 1000);

  // 언마운트 시 또는 다음 effect 실행 전 호출
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 실제 사용 예시

```javascript
// API 호출
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch("/api/data");
    setData(await response.json());
  };
  fetchData();
}, []);

// 이벤트 리스너
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

// 디바운스된 값으로 중복 체크 (실습 코드)
useEffect(() => {
  if (idValidation.shouldCheck) {
    checkDuplicate("id", debouncedId);
  }
}, [idValidation.shouldCheck, debouncedId, checkDuplicate]);
```

---

## 7. Hooks 사용 규칙

### 두 가지 규칙

1. **최상위에서만 호출**: 반복문, 조건문, 중첩 함수 안에서 호출 금지
2. **React 함수 내에서만 호출**: 일반 JavaScript 함수에서 호출 금지

```javascript
// ❌ 잘못된 사용
if (condition) {
  useEffect(() => { ... }); // 조건문 안에서 호출
}

// ✅ 올바른 사용
useEffect(() => {
  if (condition) {
    // 조건부 로직은 effect 내부에서
  }
}, [condition]);
```

---

## 8. 실습 내용

### 진행한 실습

- React 프로젝트 폴더 구조 설계 (components, layouts, hooks, pages 분리)
- React Router로 /login, /signup 등 URL 라우팅 구현
- useSignupForm 커스텀 훅 작성 및 연동
- useDebounce 훅으로 입력 디바운싱 처리
- useState, useRef, useMemo, useCallback, useEffect 활용

---
