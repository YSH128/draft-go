# 로컬 개발 환경 설정 가이드 (Docker Compose)

> 이 가이드는 **로컬 개발 환경**에서 Docker Compose를 사용하여 MongoDB, MySQL, Redis를 쉽게 구성하는 방법을 설명합니다.

## 📋 목차
1. [Docker Compose 설치](#-docker-compose-설치)
2. [기존 서비스 종료](#-선행-작업-기존-mysqlmongodb-종료)
3. [환경 변수 설정](#-환경-변수-설정)
4. [포트 확인](#-포트-확인)
5. [인프라 실행](#-docker-compose로-인프라-실행)
6. [명령어 레퍼런스](#docker-compose-명령어)

---

## 🚀 Docker Compose 설치

### Windows
1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) 다운로드
2. 설치 파일 실행 및 설치 완료
3. Docker Desktop에 Docker Compose가 포함되어 있으므로 별도 설치 불필요

설치 확인:
```bash
docker compose version
```

### macOS
[Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) 다운로드 및 설치

또는 Homebrew 사용:
```bash
brew install --cask docker
```

### Linux
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## ⚠️ 선행 작업: 기존 MySQL/MongoDB 종료

**이 프로젝트의 docker-compose.yml은 로컬 개발 전용입니다.** 

로컬에 MySQL, MongoDB, Redis가 이미 설치되어 있고 실행 중이라면 **반드시 종료**해야 합니다. Docker Compose와 포트 충돌이 발생하기 때문입니다.

### Windows

#### MySQL 종료
```bash
# MySQL 서비스 중지 (설치 시 Windows 서비스로 등록된 경우)
net stop MySQL80

# 또는 특정 포트 3306 사용 중인 프로세스 확인 및 종료
netstat -ano | findstr :3306
taskkill /PID <PID> /F
```

#### MongoDB 종료
```bash
# 포트 27017 사용 중인 프로세스 확인
netstat -ano | findstr :27017

# 프로세스 종료
taskkill /PID <PID> /F
```

#### Redis 종료
```bash
# 포트 6379 사용 중인 프로세스 확인
netstat -ano | findstr :6379

# 프로세스 종료
taskkill /PID <PID> /F
```

### macOS/Linux

```bash
# MySQL 종료
brew services stop mysql

# MongoDB 종료
brew services stop mongodb-community

# Redis 종료
brew services stop redis
```

---

## 1️⃣ 환경 변수 설정

**반드시 먼저 수행해야 합니다.** Docker Compose 실행 전에 환경 변수를 설정해야 합니다.

### 1. `.env.example`을 `.env`로 복사

프로젝트 루트에서:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

### 2. `.env` 파일 수정

프로젝트 루트의 `.env` 파일을 열어 다음 값들을 수정합니다:

| 변수명 | 필수 | 설명 | 기본값 |
|--------|------|------|--------|
| `MONGO_URI` | ❌ | MongoDB 연결 URL | `mongodb://mongodb:27017/draft-go-db` |
| `MYSQL_URL` | ❌ | MySQL 연결 URL | `jdbc:mysql://mysql:3306/draft_go_db?useSSL=false&serverTimezone=UTC` |
| `MYSQL_USERNAME` | ❌ | MySQL 사용자명 | `root` |
| `MYSQL_PASSWORD` | ❌ | MySQL 비밀번호 | `root` |
| `RIOT_API_KEY` | ✅ **필수** | Riot Games API 키 | - |
| `JWT_SECRET` | ✅ **필수** | JWT 서명 키 (최소 64자, HS512용) | - |
| `JWT_ACCESS_TOKEN_VALIDITY_IN_SECONDS` | ❌ | 액세스 토큰 유효시간(초) | `1800` |
| `JWT_REFRESH_TOKEN_VALIDITY_IN_SECONDS` | ❌ | 리프레시 토큰 유효시간(초) | `604800` |
| `RIOT_API_MODE` | ❌ | Riot API 모드 | `REAL` |

#### 필수 변경 사항

**1. Riot API Key**
```
RIOT_API_KEY=your-riot-api-key-here
```
- [Riot Developer Portal](https://developer.riotgames.com)에서 발급받은 키로 변경

**2. JWT Secret (보안)**
```
JWT_SECRET=your-secret-key-min-64-characters-long-for-hs512-algorithm
```
- **최소 64자 이상**의 새로운 값으로 변경 (HS512 알고리즘은 최소 512 bits 필요)
- 다음 명령어로 생성 가능:
  ```bash
  # macOS/Linux (64자 Base64)
  openssl rand -base64 48
  
  # Windows (PowerShell)
  [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
  ```
- 생성된 값의 길이를 확인하여 64자 이상인지 확인

#### 로컬 클라이언트 접근 (Workbench, MongoDB Compass 등)

Docker Compose 실행 후 로컬 도구에서 다음 주소로 접근 가능:

- **MySQL Workbench**: 
  ```
  Host: localhost (또는 127.0.0.1)
  Port: 3306
  Username: root
  Password: root (또는 .env의 MYSQL_PASSWORD 값)
  ```

- **MongoDB Compass**:
  ```
  Connection String: mongodb://localhost:27017/draft-go-db
  ```

- **MySQL CLI**:
  ```bash
  mysql -h 127.0.0.1 -P 3306 -u root -p
  ```

---

## 2️⃣ 포트 확인

Docker Compose 실행 전 필요한 포트가 이미 사용 중이 아닌지 확인해야 합니다.

필요한 포트:
- **3306** (MySQL)
- **27017** (MongoDB)
- **6379** (Redis)

포트 충돌이 있으면 Docker Compose 시작 시 에러가 발생합니다. 충돌이 있다면 [기존 서비스 종료](#-선행-작업-기존-mysqlmongodb-종료) 섹션을 참고하여 해결하세요.

---

## 3️⃣ Docker Compose로 인프라 실행

모든 환경 변수 설정을 완료한 후, 프로젝트 루트에서 다음 명령어를 실행합니다:

```bash
docker compose up -d
```

### 서비스 상태 확인

모든 서비스가 정상 실행되는지 확인:

```bash
docker compose ps
```

정상 실행 시 다음과 같이 표시됩니다:
```
NAME                COMMAND                  SERVICE             STATUS
draft-go-mongodb    "mongod"                 mongodb             Up (healthy)
draft-go-mysql      "docker-entrypoint.s…"  mysql               Up (healthy)
draft-go-redis      "redis-server …"        redis               Up (healthy)
```

### 로그 확인

서비스 시작 로그 확인 (문제 진단용):

```bash
docker compose logs -f
```

특정 서비스 로그만 보기:
```bash
docker compose logs -f mysql
docker compose logs -f mongodb
docker compose logs -f redis
```

---

## Docker Compose 구조

### 제공되는 서비스

| 서비스 | 컨테이너명 | 포트 | 데이터 유지 | 설명 |
|--------|-----------|------|----------|------|
| MongoDB | draft-go-mongodb | 27017 | ✅ volumes | Riot API 데이터 저장 |
| MySQL | draft-go-mysql | 3306 | ✅ volumes | 회원, 드래프트 등 주요 데이터 |
| Redis | draft-go-redis | 6379 | ✅ volumes | 세션, 캐시 저장 |

### MySQL 스키마 자동 생성

Docker Compose 실행 시 `src/main/resources/mysql_schema.sql`의 SQL이 자동으로 실행되어 다음 테이블들이 생성됩니다:

- `member` - 회원 정보
- `draft` - 드래프트 세션
- `draft_member` - 드래프트 참가자
- `team` - 팀 정보
- `teammate` - 팀 구성원

### 데이터 유지 방식

모든 데이터베이스는 Docker volumes를 사용하여 데이터가 **영구 보존**됩니다:

```yaml
volumes:
  mongodb_data:     # MongoDB 데이터
  mongodb_config:   # MongoDB 설정
  mysql_data:       # MySQL 데이터
  redis_data:       # Redis 데이터
```

컨테이너를 중지하거나 삭제해도 데이터는 유지되며, 다시 `docker compose up`을 실행하면 이전 데이터가 복구됩니다.

---

## Docker Compose 명령어

### 시작

```bash
# 백그라운드에서 실행 (권장)
docker compose up -d

# 로그를 보며 실행
docker compose up
```

### 중지 및 종료

```bash
# 컨테이너만 중지 (데이터 유지)
docker compose stop

# 컨테이너 종료 및 제거 (데이터 유지)
docker compose down

# 모든 데이터 삭제 (주의! 되돌릴 수 없음)
docker compose down -v
```

### 로그 확인

```bash
# 모든 서비스 로그 (실시간)
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f mongodb
docker compose logs -f mysql
docker compose logs -f redis

# 최근 50줄만 보기
docker compose logs --tail=50
```

### 상태 확인

```bash
docker compose ps
```

### 서비스 재시작

```bash
# 모든 서비스 재시작
docker compose restart

# 특정 서비스 재시작
docker compose restart mongodb
docker compose restart mysql
```

---

## MongoDB 데이터 확인

### Docker 컨테이너에서 mongosh 실행

```bash
docker compose exec mongodb mongosh
```

### 데이터베이스 목록 확인

```bash
# mongosh 프롬프트에서
show dbs

# 특정 데이터베이스 선택
use draft-go-db

# 컬렉션 조회
show collections

# 문서 조회 예시
db.champions.find().limit(5)
```

---

## 트러블슈팅

### 포트 충돌 에러

**에러 메시지:**
```
Error response from daemon: Ports are not available: exposing port UDP 3306 failed
```

**해결 방법:**
1. [기존 서비스 종료](#-선행-작업-기존-mysqlmongodb-종료) 섹션 참고
2. 또는 `docker-compose.yml`에서 포트 번호 변경 (예: `3307:3306`)

### 컨테이너 시작 실패

```bash
# 로그 확인
docker compose logs

# 컨테이너 제거 후 재시작
docker compose down
docker compose up -d
```

### 환경 변수 읽기 실패

`.env` 파일이 프로젝트 루트(`docker-compose.yml`과 같은 경로)에 있는지 확인하세요.

---

## 참고사항

### ✅ 안전한 작업
- `docker compose stop` - 컨테이너 중지, 데이터 유지
- `docker compose down` - 컨테이너 종료, 데이터 유지

### ❌ 데이터 손실
- `docker compose down -v` - **모든 데이터 삭제 (되돌릴 수 없음)**

### Git 관리
```bash
# .env.example은 커밋 (다른 개발자가 참고)
git add .env.example

# .env는 커밋하지 않음 (민감한 정보 포함)
# .gitignore에 .env가 등록되어 있는지 확인
cat .gitignore | grep .env
```

---

## Spring Boot 애플리케이션 연동

Docker Compose로 인프라가 실행되면, Spring Boot 애플리케이션은 `application.properties`의 다음 환경 변수들을 자동으로 읽습니다:

```properties
spring.mongodb.uri=${MONGO_URI}
spring.datasource.url=${MYSQL_URL}
spring.datasource.username=${MYSQL_USERNAME}
spring.datasource.password=${MYSQL_PASSWORD}
riot.api.key=${RIOT_API_KEY}
```
이로써 애플리케이션은 Docker Compose로 실행된 MongoDB와 MySQL에 연결할 수 있습니다.
