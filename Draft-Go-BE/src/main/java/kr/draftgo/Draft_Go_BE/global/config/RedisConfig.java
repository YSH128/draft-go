package kr.draftgo.Draft_Go_BE.global.config;

import kr.draftgo.Draft_Go_BE.draft.auction.listener.AuctionExpireListener;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.JdkSerializationRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Configuration
@RequiredArgsConstructor
public class RedisConfig {

    @Bean
    public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
        return com.fasterxml.jackson.databind.json.JsonMapper.builder()
                .addModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Use JDK Serialization for values (requires Serializable classes)
        // Fix for DevTools ClassLoader issue: use the classloader of the object type or
        // specific logic
        JdkSerializationRedisSerializer serializer = new JdkSerializationRedisSerializer(getClass().getClassLoader());
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        return template;
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            AuctionExpireListener auctionExpireListener) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // Listen to Key Expiration Events
        container.addMessageListener(auctionExpireListener, new PatternTopic("__keyevent@*__:expired"));

        return container;
    }

    @Component
    @RequiredArgsConstructor
    static class RedisKeyspaceNotificationInitializer {

        private final RedisConnectionFactory connectionFactory;

        @PostConstruct
        public void init() {
            try (var connection = connectionFactory.getConnection()) {
                String config = connection.serverCommands().getConfig("notify-keyspace-events")
                        .getProperty("notify-keyspace-events");
                if (config == null || !config.contains("Ex")) {
                    System.out.println("[RedisConfig] Enabling Keyspace Notifications (Ex)...");
                    connection.serverCommands().setConfig("notify-keyspace-events", "Ex");
                }
            } catch (Exception e) {
                System.err.println("[RedisConfig] Failed to configure Redis keyspace notifications automatically: "
                        + e.getMessage());
            }
        }
    }
}
