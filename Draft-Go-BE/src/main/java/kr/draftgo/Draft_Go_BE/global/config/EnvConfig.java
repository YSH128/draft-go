package kr.draftgo.Draft_Go_BE.global.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

/**
 * .env 파일 로드 설정
 * 애플리케이션 시작 시 .env 파일의 모든 환경 변수를 System properties로 등록합니다.
 */
@Configuration
public class EnvConfig {

	static {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(entry ->
			System.setProperty(entry.getKey(), entry.getValue())
		);
	}
}
