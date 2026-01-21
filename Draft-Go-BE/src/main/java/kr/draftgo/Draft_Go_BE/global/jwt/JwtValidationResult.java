package kr.draftgo.Draft_Go_BE.global.jwt;

import kr.draftgo.Draft_Go_BE.global.exception.ErrorType;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * JWT 토큰 검증 결과를 담는 클래스
 */
@Getter
@AllArgsConstructor
public class JwtValidationResult {
    private final boolean valid;
    private final ErrorType errorType;
    private final String errorMessage;

    /**
     * 검증 성공 결과 생성
     */
    public static JwtValidationResult success() {
        return new JwtValidationResult(true, null, null);
    }

    /**
     * 검증 실패 결과 생성
     */
    public static JwtValidationResult failure(ErrorType errorType, String errorMessage) {
        return new JwtValidationResult(false, errorType, errorMessage);
    }
}
