package kr.draftgo.Draft_Go_BE.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Configuration
public class MockBeanConfig {

    @Bean
    public SimpMessagingTemplate simpMessagingTemplate() {
        return new SimpMessagingTemplate();
    }
}
