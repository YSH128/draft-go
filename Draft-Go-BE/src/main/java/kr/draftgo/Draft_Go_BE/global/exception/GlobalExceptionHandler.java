package kr.draftgo.Draft_Go_BE.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * 애플리케이션 전역 예외 처리기
 *
 * 예외 처리 우선순위:
 * 1. AuthenticationException - Spring Security 인증 예외를 JwtAuthenticationEntryPoint로 위임
 * 2. AccessDeniedException - Spring Security 권한 예외를 JwtAccessDeniedHandler로 위임
 * 3. CustomException - 비즈니스 로직 예외
 * 4. MethodArgumentNotValidException - 요청 데이터 검증 실패
 * 5. Exception - 기타 예상치 못한 예외
 *
 * 주의:
 * - Spring Security 예외들은 다시 던져서 각각의 전용 Handler가 처리하도록 합니다.
 * - 필터 체인의 예외는 애초에 여기로 오지 않고 바로 Handler로 갑니다.
 * - @PreAuthorize 등 메서드 시큐리티의 예외만 여기서 잡아서 다시 던집니다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * AuthenticationException 처리
     *
     * @PreAuthorize("isAuthenticated()") 등에서 인증되지 않은 사용자 접근 시 발생하는
     * InsufficientAuthenticationException 등을 JwtAuthenticationEntryPoint로 위임합니다.
     *
     * @throws AuthenticationException 예외를 다시 던져서 JwtAuthenticationEntryPoint가 처리하도록 함
     */
    @ExceptionHandler(AuthenticationException.class)
    public void handleAuthenticationException(AuthenticationException ex) throws AuthenticationException {
        // AuthenticationException을 다시 던져서 JwtAuthenticationEntryPoint가 처리하도록 함
        throw ex;
    }

    /**
     * AccessDeniedException 처리
     *
     * @PreAuthorize, @Secured 등 메서드 시큐리티에서 발생하는 AccessDeniedException을
     * JwtAccessDeniedHandler로 위임하여 중복 코드를 제거하고 일관된 처리를 보장합니다.
     *
     * @throws AccessDeniedException 예외를 다시 던져서 JwtAccessDeniedHandler가 처리하도록 함
     */
    @ExceptionHandler(AccessDeniedException.class)
    public void handleAccessDeniedException(AccessDeniedException ex) throws AccessDeniedException {
        // AccessDeniedException을 다시 던져서 JwtAccessDeniedHandler가 처리하도록 함
        // 이렇게 하면 필터 레벨과 컨트롤러 레벨의 예외 처리 로직이 통일됨
        throw ex;
    }

    /**
     * CustomException 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.of(ex);
        return new ResponseEntity<>(errorResponse, ex.getErrorType().getHttpStatus());
    }


    /**
     * 유효성 검사 에러 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        String detailMessage = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> {
                    if (error instanceof org.springframework.validation.FieldError) {
                        return ((org.springframework.validation.FieldError) error).getField() + ": "
                                + error.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .orElse("Validation failed");

        ErrorResponse errorResponse = ErrorResponse.of(ErrorType.VALIDATION_ERROR, detailMessage);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * 기타 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        log.error("Unhandled exception occurred: ", ex);
        ErrorResponse errorResponse = ErrorResponse.of(ErrorType.INTERNAL_SERVER_ERROR, ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
