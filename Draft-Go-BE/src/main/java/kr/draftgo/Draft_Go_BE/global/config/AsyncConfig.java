package kr.draftgo.Draft_Go_BE.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {

    @org.springframework.context.annotation.Bean(name = "riotApiExecutor")
    public java.util.concurrent.Executor riotApiExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor executor = new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(5000);
        executor.setThreadNamePrefix("RiotApi-");
        executor.initialize();
        return executor;
    }
}
