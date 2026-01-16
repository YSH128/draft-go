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

| 폴더           | 역할                  | 예시                              |
| -------------- | --------------------- | --------------------------------- |
| **components** | 재사용 가능한 UI 요소 | Button, Input, Card, Modal        |
| **layouts**    | 페이지 공통 레이아웃  | Header, Footer, Sidebar 포함 구조 |
| **hooks**      | 커스텀 훅             | useSignupForm, useDebounce        |
| **pages**      | 라우팅 대상 페이지    | LoginPage, SignupPage, HomePage   |

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

| 컴포넌트          | 설명                                |
| ----------------- | ----------------------------------- |
| `<BrowserRouter>` | HTML5 History API를 사용한 라우터   |
| `<Routes>`        | Route들을 감싸는 컨테이너           |
| `<Route>`         | path와 element를 매핑               |
| `<Link>`          | 페이지 이동 링크 (a 태그 대신 사용) |
| `<Navigate>`      | 프로그래밍 방식 리다이렉트          |

### 페이지 이동 방법

```javascript
// 선언적 방식 - Link 컴포넌트
import { Link } from "react-router-dom";
<Link to="/login">로그인</Link>;

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
  const { formData, errors, handleIdChange, handleSubmit } =
    useSignupForm();

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.id}
        onChange={handleIdChange}
      />
      {errors.id && <span>{errors.id}</span>}
    </form>
  );
}
```

---

## 4. 실습 내용

### 진행한 실습

- React 프로젝트 폴더 구조 설계 (components, layouts, hooks, pages 분리)
- React Router로 /login, /signup 등 URL 라우팅 구현
- useSignupForm 커스텀 훅 작성 및 연동

---
