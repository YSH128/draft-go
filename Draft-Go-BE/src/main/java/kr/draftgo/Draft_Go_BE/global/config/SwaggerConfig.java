package kr.draftgo.Draft_Go_BE.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Bean
    public OpenAPI customOpenAPI() {
        List<Server> servers = new ArrayList<>();

        Server httpsServer = new Server();
        httpsServer.setUrl("https://draft-go.com");
        httpsServer.setDescription("Production Server (HTTPS)");
        servers.add(httpsServer);

        // 로컬 개발 환경에서만 HTTP 서버 추가
        if ("dev".equals(activeProfile) || "local".equals(activeProfile)) {
            Server localServer = new Server();
            localServer.setUrl("http://localhost:8080");
            localServer.setDescription("Local Development Server (HTTP)");
            servers.add(localServer);
        }

        return new OpenAPI()
                .servers(servers) // HTTPS를 기본(첫 번째)으로 설정
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .info(new Info()
                        .title("Draft-Go API")
                        .version("v1")
                        .description("Draft & Auction System API Documentation"));
    }
}
