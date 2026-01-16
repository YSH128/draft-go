# Day 1 - React 학습 (2026-01-12)

## 1. useReducer

### useReducer란?

`useReducer`는 React Hook 중 하나로, `useState`보다 복잡한 상태 관리가 필요할 때 사용하는 Hook이다. 여러 개의 하위 값을 포함하는 복잡한 state를 다루거나, 다음 state가 이전 state에 의존적인 경우에 유용합니다.

### 기본 문법

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

- **state**: 현재 상태 값
- **dispatch**: action을 발생시키는 함수
- **reducer**: state를 업데이트하는 함수 `(state, action) => newState`
- **initialState**: 초기 상태 값

### Reducer 함수 구조

```javascript
function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
}
```

### 사용 예시

```javascript
import { useReducer } from "react";

function Counter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button
        onClick={() => dispatch({ type: "INCREMENT" })}
      >
        +
      </button>
      <button
        onClick={() => dispatch({ type: "DECREMENT" })}
      >
        -
      </button>
    </div>
  );
}
```

### useState vs useReducer

#### useState를 사용하는 경우

- 관리할 상태가 단순한 값(문자열, 숫자, 불리언 등)일 때
- state 업데이트 로직이 간단할 때

```javascript
const [count, setCount] = useState(0);
setCount(count + 1);
```

#### useReducer를 사용하는 경우

- 상태 구조가 복잡할 때 (객체나 배열)
- 상태 업데이트 로직이 복잡하거나 여러 하위 값을 포함할 때
- 다음 state가 이전 state에 의존적일 때
- 여러 컴포넌트에서 동일한 상태 업데이트 로직을 공유해야 할 때

```javascript
const [state, dispatch] = useReducer(reducer, {
  count: 0,
  user: null,
  loading: false,
});

dispatch({ type: "SET_USER", payload: userData });
```

### 장점

1. **상태 업데이트 로직 분리**: 컴포넌트 외부로 상태 업데이트 로직을 분리하여 코드 가독성 향상
2. **예측 가능한 상태 관리**: reducer 함수를 통해 상태 변화를 명확하게 파악 가능
3. **테스트 용이성**: reducer 함수는 순수 함수이므로 테스트가 쉬움
4. **디버깅 편의성**: action type을 통해 어떤 동작이 실행되었는지 명확히 추적 가능

---

## 2. 최적화

### 최적화란?

React 애플리케이션의 성능을 향상시키기 위한 기법들을 의미한다. 불필요한 렌더링을 방지하고, 무거운 연산을 최소화하여 사용자 경험을 개선하는 것이 목적이다.

### 최적화가 필요한 경우

- 컴포넌트가 불필요하게 자주 리렌더링될 때
- 복잡한 연산이 매 렌더링마다 반복될 때
- 자식 컴포넌트가 부모의 상태 변경에 영향을 받지 않는데도 리렌더링될 때
- 함수가 매 렌더링마다 새로 생성되어 자식 컴포넌트의 props가 변경될 때

---

### useMemo와 연산 최적화

#### useMemo란?

메모이제이션(Memoization)을 통해 **연산의 결과값**을 캐싱하는 Hook이다. 의존성 배열의 값이 변경되지 않으면 이전에 계산한 값을 재사용한다.

#### 기본 문법

```javascript
const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
);
```

- 첫 번째 인자: 메모이제이션할 값을 반환하는 함수
- 두 번째 인자: 의존성 배열 (이 값들이 변경될 때만 재계산)

#### 언제 사용할까?

- 복잡한 계산이나 연산이 필요할 때
- 배열을 가공(filter, map, sort 등)할 때
- 객체나 배열을 새로 생성하는 경우 (참조 동일성 유지)

---

### React.memo와 컴포넌트 렌더링 최적화

#### React.memo란?

고차 컴포넌트(HOC)로, **컴포넌트의 리렌더링**을 방지한다. props가 변경되지 않으면 이전 렌더링 결과를 재사용한다.

#### 기본 문법

```javascript
const MemoizedComponent = React.memo(Component);
```

#### 커스텀 비교 함수

```javascript
const MyComponent = memo(
  Component,
  (prevProps, nextProps) => {
    // true를 반환하면 리렌더링 하지 않음
    // false를 반환하면 리렌더링 함
    return prevProps.id === nextProps.id;
  }
);
```

#### 언제 사용할까?

- 컴포넌트가 같은 props로 자주 렌더링될 때
- 컴포넌트의 렌더링 비용이 클 때 (복잡한 UI)
- 부모 컴포넌트가 자주 리렌더링되지만 자식은 그럴 필요가 없을 때

#### 주의사항

- 모든 컴포넌트에 무분별하게 사용하지 말 것 (메모이제이션 비용이 더 클 수 있음)
- props로 객체나 함수를 전달할 때는 useMemo나 useCallback과 함께 사용

---

### useCallback과 함수 재생성 방지

#### useCallback이란?

**함수 자체**를 메모이제이션하는 Hook이다. 의존성 배열의 값이 변경되지 않으면 이전에 생성한 함수를 재사용한다.

#### 기본 문법

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

#### useMemo vs useCallback

- **useMemo**: 연산된 **값**을 메모이제이션
- **useCallback**: **함수**를 메모이제이션

#### 언제 사용할까?

- 자식 컴포넌트에 함수를 props로 전달할 때
- React.memo와 함께 사용할 때
- useEffect의 의존성 배열에 함수를 넣을 때

#### 주의사항

- 모든 함수에 무분별하게 사용하지 말 것
- 의존성 배열을 정확히 명시해야 함
- 최적화가 필요한 경우에만 사용 (성능 측정 후 적용)

---
