package kr.draftgo.Draft_Go_BE.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Method Security 설정
 * RoleHierarchy 빈이 자동으로 적용됨 (SecurityConfig에서 정의)
 */
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
}
