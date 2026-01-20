package kr.draftgo.Draft_Go_BE.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorType {
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "토큰이 유효하지 않습니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "토큰이 만료되었습니다"),
    MISSING_TOKEN(HttpStatus.UNAUTHORIZED, "MISSING_TOKEN", "토큰이 없습니다"),

    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원을 찾을 수 없습니다"),

    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "DUPLICATE_USERNAME", "이미 존재하는 아이디입니다"),
    DUPLICATE_SUMMONER(HttpStatus.CONFLICT, "DUPLICATE_SUMMONER", "이미 등록된 소환사 닉네임입니다"),

    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "유효성 검사에 실패했습니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String defaultMessage;

    ErrorType(HttpStatus httpStatus, String code, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

}
