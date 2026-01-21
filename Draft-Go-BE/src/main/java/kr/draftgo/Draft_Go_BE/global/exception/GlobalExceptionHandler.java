package kr.draftgo.Draft_Go_BE.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

//
// Global 예외 처리가 WebFlux와 충돌을 일으키는 문제로 인해 주석 처리함
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * CustomException 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.of(ex);
        return new ResponseEntity<>(errorResponse, ex.getErrorType().getHttpStatus());
    }

    /**
     * Spring Security - 인증 실패 처리
     * (BadCredentialsException, InsufficientAuthenticationException 등)
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        log.warn("Authentication failed: {}", ex.getMessage());

        ErrorResponse errorResponse;
        if (ex instanceof BadCredentialsException) {
            errorResponse = ErrorResponse.of(ErrorType.AUTHENTICATION_FAILED, "아이디 또는 비밀번호가 올바르지 않습니다");
        } else if (ex instanceof InsufficientAuthenticationException) {
            errorResponse = ErrorResponse.of(ErrorType.MISSING_TOKEN, "인증 정보가 필요합니다");
        } else {
            errorResponse = ErrorResponse.of(ErrorType.AUTHENTICATION_FAILED, ex.getMessage());
        }

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Spring Security - 접근 거부 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.of(ErrorType.ACCESS_DENIED, "해당 리소스에 접근할 권한이 없습니다");
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
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
