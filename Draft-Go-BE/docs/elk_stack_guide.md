# ELK Stack 구축 및 운영 가이드

이 문서는 프로젝트의 로그 모니터링을 위한 ELK (Elasticsearch, Logstash, Kibana) 스택의 구축 방법, 서버 배포 절차, 그리고 변경 사항을 정리한 가이드입니다.

## 1. 아키텍처 개요

ELK 스택은 메인 애플리케이션(`Draft-Go-BE`)과 **독립적**으로 운영됩니다.

*   **위치**: 서버의 별도 디렉토리 (예: `/home/ubuntu/draft-go/elk`)
*   **통신 방식 (Push)**:
    *   **Spring Boot App** (Sender) -> **Logstash** (Receiver, Port 5000) -> **Elasticsearch** (Storage) -> **Kibana** (Viewer)
*   **포트 정보**:
    *   **5000 (TCP)**: Logstash 로그 수신용
    *   **9200 (HTTP)**: Elasticsearch 데이터베이스
    *   **5601 (HTTP)**: Kibana 웹 인터페이스

---

## 2. 프로젝트 변경 사항 (이미 적용됨)

### 2.1 Build 설정 (`build.gradle`)
Logstash로 JSON 형식의 로그를 보내기 위한 인코더 라이브러리가 추가되었습니다.
```groovy
implementation 'net.logstash.logback:logstash-logback-encoder:7.4'
```

### 2.2 로그 설정 (`logback-spring.xml`)
`src/main/resources/logback-spring.xml` 파일이 생성되었으며, 로그를 `localhost:5000`으로 전송하도록 설정되어 있습니다.
> **참고**: `localhost`는 배포되는 서버 내부에서 Logstash 컨테이너와 통신함을 의미합니다.

---

## 3. 서버 배포 및 실행 가이드

### 3.1 파일 전송
로컬 PC에서 `elk` 폴더를 서버로 전송합니다. (MobaXterm 사용 - drag and drop)


### 3.2 ELK 스택 실행
서버에 SSH 접속 후 실행합니다.

```bash
cd /home/ubuntu/draft-go/elk
docker-compose up -d
```

### 3.3 설치 확인
```bash
docker-compose ps
# independent-elasticsearch, independent-logstash, independent-kibana 상태가 Up 이어야 함
```

---

## 4. Nginx 설정 (외부 접속 허용)

Kibana를 `https://draft-go.com/kibana` 주소로 접속하기 위해 Nginx 설정을 추가했습니다.

**파일 위치**: `/etc/nginx/sites-available/default` (또는 사용자 환경에 맞는 conf 파일)

**추가된 내용 (`server` 블록 내부)**:
```nginx
      # ===============================
      # 3️⃣ ELK Kibana (/kibana)
      # ===============================
      location /kibana/ {
          proxy_pass http://127.0.0.1:5601;
          
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto https;
      }
```
**적용 명령어**:
```bash
sudo nginx -t     # 문법 검사
sudo service nginx reload  # 재시작
```

---

## 5. Kibana 사용 방법

1.  **접속**: [https://draft-go.com/kibana](https://draft-go.com/kibana)
2.  **초기 설정 (최초 1회)**:
    *   **Stack Management** > **Index Patterns** 이동
    *   **Create index pattern** 클릭
    *   Name: `app-logs-*` 입력 (Spring 앱이 한번이라도 실행되어 로그를 보냈어야 뜸)
    *   Timestamp field: `@timestamp` 선택
3.  **로그 확인**:
    *   **Observability** > **Logs** > **Stream** 메뉴 클릭
    *   실시간으로 들어오는 로그 확인 가능
    *   (설정에서 Indices를 `app-logs-*`로 변경해야 할 수도 있음)

---

## 6. 문제 해결 (Troubleshooting)

*   **Kibana 접속 시 404 에러**:
    *   `elk/docker-compose.yml`에 `SERVER_BASEPATH=/kibana` 등의 설정이 잘 되어 있는지 확인하고 컨테이너를 재시작(`down` -> `up`) 해보세요.
*   **Index Pattern이 생성 안 됨**:
    *   Spring Boot 앱이 실행 중인지 확인하세요.
    *   `docker logs independent-logstash`를 쳐서 로그를 받고 있는지 확인하세요.
