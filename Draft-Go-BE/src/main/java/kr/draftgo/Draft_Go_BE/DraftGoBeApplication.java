package kr.draftgo.Draft_Go_BE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DraftGoBeApplication {

	public static void main(String[] args) {
		// 1. Try specific directory (VSCode root context)
		Dotenv dotenv = Dotenv.configure().directory("./Draft-Go-BE").ignoreIfMissing().load();

		// 2. Fallback to default (Terminal context)
		if (dotenv.get("RIOT_API_KEY") == null) {
			dotenv = Dotenv.configure().ignoreIfMissing().load();
		}

		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

		SpringApplication.run(DraftGoBeApplication.class, args);
	}
}
