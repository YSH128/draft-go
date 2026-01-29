# Spring Security 예외 처리 아키텍처

## 개요

Spring Security의 예외 처리는 **필터 레벨**과 **컨트롤러 레벨**로 구분되어야 합니다.
이 문서는 프로젝트의 Security 예외 처리 구조를 설명합니다.

## 예외 처리 책임 분리

### 1. 필터 레벨 (Filter Chain)
**담당 컴포넌트**: `JwtAuthenticationFilter`, `JwtAuthenticationEntryPoint`, `JwtAccessDeniedHandler`

Spring Security 필터 체인에서 발생하는 예외들을 처리합니다.

#### JwtAuthenticationFilter
- **역할**: JWT 토큰 추출 및 검증, SecurityContext에 인증 정보 설정
- **예외 처리 방식**: 예외를 던지지 않고, request attribute에 에러 정보 설정
- **처리 흐름**:
  1. Authorization 헤더에서 JWT 토큰 추출
  2. 토큰이 있으면 검증 수행
     - ✅ 성공: SecurityContext에 인증 정보 설정
     - ❌ 실패: request에 `jwtErrorType`, `jwtErrorMessage` 설정
  3. 토큰이 없으면 인증 정보 설정 안 함

```java
// 토큰 검증 실패 시
request.setAttribute("jwtErrorType", ErrorType.EXPIRED_TOKEN);
request.setAttribute("jwtErrorMessage", "토큰이 만료되었습니다");
```

#### JwtAuthenticationEntryPoint
- **역할**: 인증되지 않은 사용자의 보호된 리소스 접근 시 호출 (필터 레벨에서만)
- **처리 케이스**:
  1. JWT 토큰이 제공되지 않고 보호된 API 접근 → `MISSING_TOKEN` 응답
  2. 필터 체인에서 발생한 기타 인증 관련 예외

> **주의**: `@PreAuthorize`에서 발생하는 예외는 여기서 처리되지 않습니다. 
> AOP는 DispatcherServlet 내부에서 동작하므로 GlobalExceptionHandler에서 처리됩니다.

```java
// 예시: 토큰 없이 보호된 API 접근 (필터에서 차단)
GET /api/v1/protected (without Authorization header)
→ 401 Unauthorized: "인증 토큰이 필요합니다"
```

#### JwtAccessDeniedHandler
- **역할**: 필터 레벨에서 발생한 AccessDeniedException 처리
- **처리 케이스**: 필터 체인에서 발생한 권한 부족 에러만 처리
- **참고**: 실제로는 거의 사용되지 않음 (대부분 EntryPoint에서 처리됨)

### 2. 컨트롤러 레벨 (@RestControllerAdvice)
**담당 컴포넌트**: `GlobalExceptionHandler`

컨트롤러 및 메서드 시큐리티(AOP)에서 발생하는 예외들을 처리합니다.

#### 처리하는 예외 (우선순위 순)
1. **AuthenticationException**: `@PreAuthorize("isAuthenticated()")` 등에서 발생 시 **다시 던져서** `JwtAuthenticationEntryPoint`로 위임
2. **AccessDeniedException**: `@PreAuthorize`, `@Secured` 등에서 발생 시 **다시 던져서** `JwtAccessDeniedHandler`로 위임
3. **CustomException**: 비즈니스 로직 예외
4. **MethodArgumentNotValidException**: 요청 데이터 검증 실패
5. **Exception**: 기타 예상치 못한 예외

#### AuthenticationException 위임 처리
`@PreAuthorize("isAuthenticated()")`에서 인증되지 않은 사용자(토큰 없음 or 유효하지 않은 토큰)가 접근하면
`InsufficientAuthenticationException`이 발생합니다. 이를 다시 던져서 `JwtAuthenticationEntryPoint`가 처리하도록 합니다.

```java
@ExceptionHandler(AuthenticationException.class)
public void handleAuthenticationException(AuthenticationException ex) 
        throws AuthenticationException {
    // 다시 던져서 JwtAuthenticationEntryPoint가 처리하도록 위임
    throw ex;
}
```

**처리 흐름**:
1. `@PreAuthorize("isAuthenticated()")`에서 `AuthenticationException` 발생
2. `GlobalExceptionHandler`가 잡아서 다시 throw
3. `JwtAuthenticationEntryPoint`가 최종 처리
   - JWT 에러 정보 확인 → JWT 에러 응답 (만료, 형식 오류 등)
   - JWT 에러 없음 → MISSING_TOKEN 응답

#### AccessDeniedException 위임 처리
`@PreAuthorize("hasRole('ADMIN')")`에서 권한이 없는 사용자가 접근하면
`AccessDeniedException`이 발생합니다. 이를 다시 던져서 `JwtAccessDeniedHandler`가 처리하도록 합니다.

```java
@ExceptionHandler(AccessDeniedException.class)
public void handleAccessDeniedException(AccessDeniedException ex) 
        throws AccessDeniedException {
    // 다시 던져서 JwtAccessDeniedHandler가 처리하도록 위임
    throw ex;
}
```

**처리 흐름**:
1. `@PreAuthorize`에서 `AccessDeniedException` 발생
2. `GlobalExceptionHandler`가 잡아서 다시 throw
3. `JwtAccessDeniedHandler`가 최종 처리
   - JWT 에러 정보 확인 → JWT 에러 응답
   - JWT 에러 없음 → 권한 부족 응답

**처리 케이스 예시**:
```java
// 케이스 1: 토큰 없이 @PreAuthorize("isAuthenticated()") 접근
@PreAuthorize("isAuthenticated()")
public void someMethod() { }

GET /api/v1/some-method (without Authorization header)
→ GlobalExceptionHandler → JwtAuthenticationEntryPoint
→ 401 Unauthorized: "인증 토큰이 필요합니다"

// 케이스 2: 만료된 토큰으로 @PreAuthorize("isAuthenticated()") 접근
GET /api/v1/some-method (with expired token)
→ GlobalExceptionHandler → JwtAuthenticationEntryPoint
→ 401 Unauthorized: "토큰이 만료되었습니다"

// 케이스 3: USER 권한으로 ADMIN 메서드 호출
@PreAuthorize("hasRole('ADMIN')")
public void adminMethod() { }

GET /api/v1/admin-method (with USER role)
→ GlobalExceptionHandler → JwtAccessDeniedHandler
→ 403 Forbidden: "해당 리소스에 접근할 권한이 없습니다"
```

## 예외 처리 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Request                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              JwtAuthenticationFilter                            │
│  - JWT 토큰 추출 및 검증                                         │
│  - 성공: SecurityContext 설정                                   │
│  - 실패: request.setAttribute("jwtErrorType", ...)             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│         Spring Security Authorization (필터 레벨)               │
│         - 필터 체인에서 권한 검사                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
          (인증 실패)           (권한 부족)
                │                    │
                ▼                    ▼
    ┌────────────────────┐  ┌────────────────────┐
    │ EntryPoint         │  │ AccessDenied       │
    │ (401 Unauthorized) │  │ Handler            │
    └────────────────────┘  │ (403 Forbidden)    │
                            └────────────────────┘
                          │
                    (인증/인가 성공)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Controller                                  │
│  - 비즈니스 로직 수행                                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
            (정상)            (@PreAuthorize 검사)
                │                    │
                ▼              ┌─────┴──────────────┐
         Success Response      │                    │
                          (성공)      (실패: AuthenticationException or AccessDeniedException)
                               │                    │
                               │                    ▼
                               │         ┌──────────────────────┐
                               │         │ GlobalException      │
                               │         │ Handler              │
                               │         │ → throw ex           │
                               │         └──────────┬───────────┘
                               │                    │
                               │          ┌─────────┴──────────┐
                               │          │                    │
                               │    (AuthenticationException) (AccessDeniedException)
                               │          │                    │
                               │          ▼                    ▼
                               │   ┌────────────────┐  ┌────────────────┐
                               │   │ JwtAuthentica- │  │ JwtAccessDenied│
                               │   │ tionEntryPoint │  │ Handler        │
                               │   │ (최종 처리)    │  │ (최종 처리)    │
                               │   └────────────────┘  └────────────────┘
                               │
                               ▼
                        Success Response
```

**핵심 포인트**:
- 필터 레벨의 예외 → 직접 Handler 호출
- `@PreAuthorize` 메서드 시큐리티의 예외 → `GlobalExceptionHandler` → 다시 throw → Handler 호출
- 결과적으로 모든 Spring Security 예외는 각각의 전용 Handler에서 통일되게 처리됨
  - `AuthenticationException` → `JwtAuthenticationEntryPoint`
  - `AccessDeniedException` → `JwtAccessDeniedHandler`

## 주요 에러 타입

| ErrorType | HttpStatus | 발생 상황 | 처리 위치 |
|-----------|------------|----------|----------|
| `MISSING_TOKEN` | 401 | 토큰이 제공되지 않음 | EntryPoint |
| `EXPIRED_TOKEN` | 401 | 토큰이 만료됨 | EntryPoint/AccessDenied |
| `INVALID_TOKEN` | 401 | 토큰 형식이 잘못됨 | EntryPoint/AccessDenied |
| `ACCESS_DENIED` | 403 | 권한이 부족함 | AccessDenied |
| `VALIDATION_ERROR` | 400 | 요청 데이터 검증 실패 | GlobalException |
| `INTERNAL_SERVER_ERROR` | 500 | 예상치 못한 서버 에러 | GlobalException |

## SecurityConfig 설정

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // JWT 인증/인가 예외 처리 핸들러 등록
        .exceptionHandling(exception -> exception
            .authenticationEntryPoint(jwtAuthenticationEntryPoint)  // 인증 실패
            .accessDeniedHandler(jwtAccessDeniedHandler)            // 권한 부족
        )
        // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
}
```

## 테스트 시나리오

### 시나리오 1: 토큰 없이 보호된 API 접근
```bash
GET /api/v1/matches/history
Authorization: (없음)

→ 401 Unauthorized
{
  "errorType": "MISSING_TOKEN",
  "message": "인증 토큰이 필요합니다"
}
```

### 시나리오 2: 만료된 토큰으로 API 접근
```bash
GET /api/v1/matches/history
Authorization: Bearer eyJhbGc...expired

→ 401 Unauthorized
{
  "errorType": "EXPIRED_TOKEN",
  "message": "토큰이 만료되었습니다"
}
```

### 시나리오 3: 유효한 토큰이지만 권한 부족
```bash
GET /api/v1/admin/users
Authorization: Bearer eyJhbGc...valid (role: USER)

→ 403 Forbidden
{
  "errorType": "ACCESS_DENIED",
  "message": "해당 리소스에 접근할 권한이 없습니다"
}
```

### 시나리오 4: 비즈니스 로직 예외
```bash
POST /api/v1/matches
Authorization: Bearer eyJhbGc...valid
Body: { "invalidData": true }

→ 400 Bad Request (GlobalExceptionHandler에서 처리)
{
  "errorType": "VALIDATION_ERROR",
  "message": "..."
}
```

## 핵심 포인트

1. **필터 체인의 예외는 @RestControllerAdvice로 처리할 수 없다**
   - Spring Security 필터는 DispatcherServlet 이전에 실행됨
   - 따라서 전용 Handler (EntryPoint, AccessDeniedHandler) 필요

2. **필터는 예외를 던지지 않는다**
   - JWT 검증 실패 시 예외를 던지면 필터 체인이 중단됨
   - 대신 request attribute에 에러 정보를 설정하고 계속 진행
   - 보호된 리소스 접근 시 Handler가 해당 정보를 사용

3. **책임의 명확한 분리**
   - 필터 레벨: 인증/인가 관련 예외
   - 컨트롤러 레벨: 비즈니스 로직 예외

4. **일관된 에러 응답 형식**
   - 모든 예외 처리에서 `ErrorResponse` 통일 사용
   - 클라이언트는 동일한 구조의 에러 응답 처리 가능

## 참고 자료

- [Spring Security Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Exception Handling for Filter Chain](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authenticationentrypoint)
