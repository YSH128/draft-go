package kr.draftgo.Draft_Go_BE.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorType {
    // 인증 관련 에러
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "토큰이 유효하지 않습니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "토큰이 만료되었습니다"),
    MISSING_TOKEN(HttpStatus.UNAUTHORIZED, "MISSING_TOKEN", "토큰이 없습니다"),
    AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", "인증에 실패했습니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "접근 권한이 없습니다"),

    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원을 찾을 수 없습니다"),

    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "DUPLICATE_USERNAME", "이미 존재하는 아이디입니다"),
    DUPLICATE_SUMMONER(HttpStatus.CONFLICT, "DUPLICATE_SUMMONER", "이미 등록된 소환사 닉네임입니다"),
    REQUIRED_FIELD_MISSING(HttpStatus.BAD_REQUEST, "REQUIRED_FIELD_MISSING", "필수 입력 항목이 누락되었습니다"),
    REFRESH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_MISMATCH", "Refresh Token이 일치하지 않습니다"),

    // Draft 관련 에러
    DRAFT_NOT_FOUND(HttpStatus.NOT_FOUND, "DRAFT_NOT_FOUND", "존재하지 않는 드래프트입니다"),
    DRAFT_START_PRICE_INVALID(HttpStatus.BAD_REQUEST, "DRAFT_START_PRICE_INVALID", "시작 포인트는 시작 가격보다 커야 합니다"),
    INVALID_DRAFT_CODE(HttpStatus.BAD_REQUEST, "INVALID_DRAFT_CODE", "유효하지 않은 참여 코드입니다"),
    ALREADY_PARTICIPATING(HttpStatus.CONFLICT, "ALREADY_PARTICIPATING", "이미 드래프트에 참여 중입니다"),
    INVALID_CODE_TYPE(HttpStatus.BAD_REQUEST, "INVALID_CODE_TYPE", "잘못된 코드 타입입니다"),
    DRAFT_NOT_IN_LOBBY(HttpStatus.BAD_REQUEST, "DRAFT_NOT_IN_LOBBY", "로비 상태에서만 퇴장할 수 있습니다"),

    // 권한 관련 에러
    UNAUTHORIZED_ADMIN_ONLY(HttpStatus.FORBIDDEN, "UNAUTHORIZED_ADMIN_ONLY", "관리자만 수행할 수 있는 작업입니다"),
    UNAUTHORIZED_POSITION_CHANGE(HttpStatus.FORBIDDEN, "UNAUTHORIZED_POSITION_CHANGE", "본인 또는 관리자만 포지션을 변경할 수 있습니다"),
    UNAUTHORIZED_LEADER_ONLY(HttpStatus.FORBIDDEN, "UNAUTHORIZED_LEADER_ONLY", "팀장만 수행할 수 있는 작업입니다"),

    // 로비 참가자 관련 에러
    PARTICIPANT_NOT_FOUND(HttpStatus.NOT_FOUND, "PARTICIPANT_NOT_FOUND", "드래프트에 참여하지 않은 사용자입니다"),

    // 드래프트 시작 검증 에러
    NO_LEADERS(HttpStatus.BAD_REQUEST, "NO_LEADERS", "팀장이 없습니다"),
    LEADERS_NOT_READY(HttpStatus.BAD_REQUEST, "LEADERS_NOT_READY", "모든 팀장이 준비 완료 상태여야 합니다"),
    NO_PLAYING_PARTICIPANTS(HttpStatus.BAD_REQUEST, "NO_PLAYING_PARTICIPANTS", "드래프트에 참여하는 플레이어가 없습니다"),
    POSITION_MISSING(HttpStatus.BAD_REQUEST, "POSITION_MISSING", "필수 포지션 참가자가 없습니다"),
    POSITION_UNBALANCED(HttpStatus.BAD_REQUEST, "POSITION_UNBALANCED", "포지션별 참가자 수가 균일하지 않습니다"),

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
