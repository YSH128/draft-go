package kr.draftgo.Draft_Go_BE.global.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {
    private final ErrorType errorType;
    private final String detailMessage;

    public CustomException(ErrorType errorType) {
        super(errorType.getDefaultMessage());
        this.errorType = errorType;
        this.detailMessage = null;
    }

    public CustomException(ErrorType errorType, String detailMessage) {
        super(detailMessage != null ? detailMessage : errorType.getDefaultMessage());
        this.errorType = errorType;
        this.detailMessage = detailMessage;
    }

    public CustomException(ErrorType errorType, String detailMessage, Throwable cause) {
        super(detailMessage != null ? detailMessage : errorType.getDefaultMessage(), cause);
        this.errorType = errorType;
        this.detailMessage = detailMessage;
    }

}
