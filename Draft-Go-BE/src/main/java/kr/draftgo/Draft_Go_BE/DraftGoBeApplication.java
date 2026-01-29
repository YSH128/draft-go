package kr.draftgo.Draft_Go_BE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 스케줄러 기능 활성화 (시즌 자동 업데이트 등)
public class DraftGoBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(DraftGoBeApplication.class, args);
	}

}
