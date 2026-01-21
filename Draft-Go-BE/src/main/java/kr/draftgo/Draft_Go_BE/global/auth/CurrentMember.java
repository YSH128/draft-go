package kr.draftgo.Draft_Go_BE.global.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 현재 인증된 Member 객체를 파라미터로 주입받기 위한 커스텀 어노테이션
 *
 * 사용 예시:
 * public ResponseEntity<?> someMethod(@CurrentMember Member member) {
 *     // member 객체 직접 사용
 * }
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : member")
public @interface CurrentMember {
}
