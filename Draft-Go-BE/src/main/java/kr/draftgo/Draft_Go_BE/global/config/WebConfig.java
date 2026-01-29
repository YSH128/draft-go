package kr.draftgo.Draft_Go_BE.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMVC 전역 설정
 * CORS 설정을 포함
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해
                .allowedOriginPatterns("*") // 모든 출처 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // 모든 HTTP 메서드 허용
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true) // 인증 정보 허용 (쿠키, Authorization 헤더 등)
                .exposedHeaders("Authorization", "Refresh-Token") // 클라이언트에 노출할 헤더
                .maxAge(3600); // preflight 요청 캐싱 시간 (초 단위)
    }
}
