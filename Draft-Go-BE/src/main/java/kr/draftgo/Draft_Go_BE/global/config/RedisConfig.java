package kr.draftgo.Draft_Go_BE.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import kr.draftgo.Draft_Go_BE.draft.auction.listener.AuctionExpireListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Configuration
@EnableRedisRepositories
@RequiredArgsConstructor
@Slf4j
public class RedisConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = JsonMapper.builder()
                .addModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        // Use field names directly instead of getter/setter inference
        // This fixes the "isReady" -> "ready" issue with boolean fields
        mapper.setVisibility(com.fasterxml.jackson.annotation.PropertyAccessor.ALL,
                com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE);
        mapper.setVisibility(com.fasterxml.jackson.annotation.PropertyAccessor.FIELD,
                com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY);

        return mapper;
    }

    /**
     * Redis 데이터 접근을 위한 RedisTemplate 설정
     *
     * @param connectionFactory Redis 연결 팩토리
     * @param objectMapper      커스텀 ObjectMapper (isReady 필드 문제 해결 설정 포함)
     * @return 설정된 RedisTemplate
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Redis 키는 문자열로 직렬화 (가독성 및 디버깅 용이)
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // 커스텀 JSON serializer 구현
        // 이유: Spring Boot 4.0에서 GenericJackson2JsonRedisSerializer와
        // Jackson2JsonRedisSerializer가 deprecated 되어 직접 구현
        // 또한 커스텀 ObjectMapper를 사용하여 isReady 필드 문제 해결
        RedisSerializer<Object> jsonSerializer = new RedisSerializer<>() {
            @Override
            public byte[] serialize(Object value) {
                if (value == null) {
                    return new byte[0];
                }
                try {
                    // 커스텀 ObjectMapper로 직렬화 (필드 기반)
                    return objectMapper.writeValueAsBytes(value);
                } catch (Exception e) {
                    throw new org.springframework.data.redis.serializer.SerializationException(
                            "Could not serialize: " + e.getMessage(), e);
                }
            }

            @Override
            public Object deserialize(byte[] bytes) {
                if (bytes == null || bytes.length == 0) {
                    return null;
                }
                try {
                    // 커스텀 ObjectMapper로 역직렬화 (필드 기반)
                    return objectMapper.readValue(bytes, Object.class);
                } catch (Exception e) {
                    throw new org.springframework.data.redis.serializer.SerializationException(
                            "Could not deserialize: " + e.getMessage(), e);
                }
            }
        };

        // Value와 Hash Value 모두 JSON으로 직렬화
        // 이유: 데이터 가독성, 타입 안정성, Serializable 구현 불필요
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        return template;
    }

    /**
     * Redis Pub/Sub 메시지 리스너 컨테이너 설정
     *
     * @param connectionFactory     Redis 연결 팩토리
     * @param auctionExpireListener 경매 타이머 만료 이벤트 처리 리스너
     * @return 설정된 메시지 리스너 컨테이너
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            AuctionExpireListener auctionExpireListener) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // Redis 키 만료 이벤트 구독
        // 이유: 경매 타이머가 만료되면 자동으로 다음 경매를 진행하기 위해
        // "__keyevent@*__:expired" 패턴으로 모든 DB의 만료 이벤트 감지
        container.addMessageListener(auctionExpireListener, new PatternTopic("__keyevent@*__:expired"));

        return container;
    }

    /**
     * Redis Keyspace Notification 자동 활성화
     *
     * Redis는 기본적으로 키 이벤트 알림이 비활성화되어 있어,
     * 애플리케이션 시작 시 자동으로 활성화하는 초기화 컴포넌트
     */
    @Component
    @RequiredArgsConstructor
    static class RedisKeyspaceNotificationInitializer {

        private final RedisConnectionFactory connectionFactory;

        /**
         * 애플리케이션 시작 시 Redis notify-keyspace-events 설정 확인 및 활성화
         *
         * 이유: 경매 타이머 만료 등의 키 만료 이벤트를 받기 위해서는
         * Redis 서버에서 "Ex" 옵션이 활성화되어 있어야 함
         * - E: Keyevent events (키 이벤트 활성화)
         * - x: Expired events (만료 이벤트 활성화)
         */
        @PostConstruct
        public void init() {
            try (var connection = connectionFactory.getConnection()) {
                // 현재 notify-keyspace-events 설정 확인
                String config = connection.serverCommands().getConfig("notify-keyspace-events")
                        .getProperty("notify-keyspace-events");

                // "Ex" 옵션이 없으면 활성화
                if (config == null || config.isEmpty() || !config.contains("Ex")) {
                    log.info("[RedisConfig] Enabling Keyspace Notifications (Ex)...");
                    connection.serverCommands().setConfig("notify-keyspace-events", "Ex");
                }
            } catch (Exception e) {
                log.error("[RedisConfig] Failed to configure Redis keyspace notifications automatically: {}",
                        e.getMessage(), e);
            }
        }
    }
}
