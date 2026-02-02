# 타임존 설정 가이드 (Asia/Seoul, UTC+9)

## 개요

본 프로젝트는 모든 시간 관련 데이터를 **Asia/Seoul (UTC+9)** 타임존 기준으로 처리합니다.

## 설정 항목

### 1. JVM 타임존 설정

**위치**: `DraftGoBeApplication.java`

```java
@PostConstruct
public void init() {
    // JVM 전역 타임존을 Asia/Seoul로 설정
    TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
}
```

- 애플리케이션 시작 시 JVM 전역 타임존을 Asia/Seoul로 설정
- `LocalDateTime.now()` 등의 모든 시간 관련 메서드가 이 타임존을 사용

### 2. MySQL 데이터베이스 설정

#### a. JDBC 연결 URL (`.env` 파일)

```properties
MYSQL_URL=jdbc:mysql://localhost:3306/draft_go_db?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&allowMultiQueries=true
```

#### b. Hibernate 타임존 설정 (`application.properties`)

```properties
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Seoul
```

- Hibernate가 MySQL과 통신할 때 Asia/Seoul 타임존 사용
- `TIMESTAMP` 컬럼의 읽기/쓰기가 Asia/Seoul 기준으로 처리됨

#### c. MySQL 컨테이너 설정 (`docker-compose.yml`)

```yaml
mysql:
  environment:
    TZ: Asia/Seoul
  command: --default-time-zone=+09:00
```

- MySQL 서버의 시스템 타임존과 데이터베이스 타임존을 모두 +09:00으로 설정
- `NOW()`, `CURRENT_TIMESTAMP` 등의 MySQL 함수가 Asia/Seoul 기준으로 동작

### 3. Jackson ObjectMapper 설정

**위치**: `RedisConfig.java`

```java
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = JsonMapper.builder()
            .addModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .build();

    // 타임존을 Asia/Seoul로 설정
    mapper.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Seoul"));
    
    return mapper;
}
```

- JSON 직렬화/역직렬화 시 Asia/Seoul 타임존 적용
- API 응답의 모든 시간 데이터가 Asia/Seoul 기준으로 포맷됨
- Redis에 저장되는 시간 데이터도 Asia/Seoul 기준

### 4. Logback 로깅 설정

**위치**: `logback-spring.xml`

```xml
<!-- 콘솔 출력 패턴 -->
<property name="CONSOLE_LOG_PATTERN" value="%d{yyyy-MM-dd HH:mm:ss.SSS, Asia/Seoul} [%thread] %-5level %logger{36} - %msg%n"/>

<!-- ELK Stack용 Logstash Encoder -->
<encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <timeZone>Asia/Seoul</timeZone>
</encoder>
```

- 모든 로그의 타임스탬프가 Asia/Seoul 기준으로 출력
- ELK Stack에 전송되는 로그도 Asia/Seoul 타임존 포함

## 적용 범위

### ✅ Asia/Seoul 타임존이 적용되는 부분

1. **API 응답**
   - `ErrorResponse`의 `timestamp` 필드
   - 모든 Entity의 `createdAt`, `updatedAt` 필드
   - `MemberProfileRes` 등 DTO의 `LocalDateTime` 필드

2. **데이터베이스**
   - MySQL의 `TIMESTAMP` 컬럼 (예: `member.created_at`, `member_stat.updated_at`)
   - 테이블의 `DEFAULT CURRENT_TIMESTAMP`

3. **로그**
   - 애플리케이션 로그의 타임스탬프
   - ELK Stack의 로그 타임스탬프

4. **Redis**
   - Redis에 저장되는 시간 관련 데이터

5. **JVM 내부**
   - `LocalDateTime.now()`
   - `@CreatedDate`, `@LastModifiedDate` (JPA Auditing)

## 환경별 설정

### 로컬 개발 환경

`.env` 파일:
```properties
MYSQL_URL=jdbc:mysql://localhost:3306/draft_go_db?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&allowMultiQueries=true
```

### 개발 서버 (Azure)

`.env` 파일:
```properties
MYSQL_URL=jdbc:mysql://ssafy-mysql-db.mysql.database.azure.com:3306/S14P11A205?serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=utf8
```

## 검증 방법

### 1. API 응답 확인

```bash
curl http://localhost:8080/api/v1/some-endpoint
```

응답 예시:
```json
{
  "timestamp": "2026-02-02T15:30:45.123",
  "createdAt": "2026-02-01T10:20:30"
}
```

### 2. 데이터베이스 확인

```sql
SELECT created_at, NOW() FROM member LIMIT 1;
```

- 두 시간이 모두 KST(한국 표준시) 기준이어야 함

### 3. 로그 확인

```
2026-02-02 15:30:45.123 [main] INFO  kr.draftgo.Draft_Go_BE.DraftGoBeApplication - Starting application...
```

- 로그 시간이 현재 한국 시간과 일치해야 함

## 주의사항

### ⚠️ 타임존 관련 안티패턴

1. **코드에서 명시적으로 UTC 사용 금지**
   ```java
   // ❌ 나쁜 예
   LocalDateTime.now(ZoneOffset.UTC)
   
   // ✅ 좋은 예
   LocalDateTime.now() // JVM 기본 타임존(Asia/Seoul) 사용
   ```

2. **프론트엔드와의 시간 동기화**
   - 프론트엔드도 동일하게 KST 기준으로 표시하도록 설정 필요
   - 또는 ISO 8601 포맷으로 타임존 정보를 포함하여 전달

3. **서버 배포 시 확인**
   - Docker 컨테이너의 타임존이 올바르게 설정되었는지 확인
   - Azure 서버의 시스템 타임존 확인

## 트러블슈팅

### 문제: API 응답의 시간이 9시간 차이 남

**원인**: ObjectMapper에 타임존이 설정되지 않음

**해결**: `RedisConfig`의 `objectMapper()` 빈에 `mapper.setTimeZone()` 추가

### 문제: 데이터베이스에 저장된 시간이 이상함

**원인**: JDBC URL의 `serverTimezone` 파라미터 누락 또는 Hibernate 타임존 설정 누락

**해결**: 
1. `.env`의 `MYSQL_URL`에 `serverTimezone=Asia/Seoul` 추가
2. `application.properties`에 `spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Seoul` 추가

### 문제: 로그 시간이 UTC로 표시됨

**원인**: Logback 설정에 타임존 미지정

**해결**: `logback-spring.xml`에 타임존 설정 추가

## 참고 자료

- [Spring Boot - JPA Timezone Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-hibernate)
- [MySQL Timezone Support](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html)
- [Jackson Date/Time Serialization](https://github.com/FasterXML/jackson-modules-java8)
