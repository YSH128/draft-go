package kr.draftgo.Draft_Go_BE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling // 스케줄러 기능 활성화 (시즌 자동 업데이트 등)
public class DraftGoBeApplication {

	@PostConstruct
	public void init() {
		// JVM 전역 타임존을 Asia/Seoul로 설정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}

	public static void main(String[] args) {
		SpringApplication.run(DraftGoBeApplication.class, args);
	}

}
