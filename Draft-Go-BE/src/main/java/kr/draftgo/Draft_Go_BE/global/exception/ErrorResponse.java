package kr.draftgo.Draft_Go_BE.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private String code;
    private String message;
    private String detailMessage;
    private LocalDateTime timestamp;

    public static ErrorResponse of(ErrorType errorType) {
        return ErrorResponse.builder()
                .code(errorType.getCode())
                .message(errorType.getDefaultMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(ErrorType errorType, String detailMessage) {
        return ErrorResponse.builder()
                .code(errorType.getCode())
                .message(errorType.getDefaultMessage())
                .detailMessage(detailMessage)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(CustomException e) {
        return ErrorResponse.builder()
                .code(e.getErrorType().getCode())
                .message(e.getErrorType().getDefaultMessage())
                .detailMessage(e.getDetailMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
