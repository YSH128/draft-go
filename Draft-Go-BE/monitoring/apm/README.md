# APM (Application Performance Monitoring)

## 개요
Prometheus + Grafana를 사용한 실시간 성능 모니터링 시스템

## 구성 요소
- **Prometheus**: 메트릭 수집 및 저장 (시계열 DB)
- **Grafana**: 메트릭 시각화 대시보드

## 모니터링 항목
- API 응답 시간 (평균, P95, P99)
- HTTP 요청 수 (TPS)
- 에러율
- JVM 메모리 사용량
- GC 시간
- DB 커넥션 풀 상태
- Thread Pool 상태

## 실행 방법

### 1. Docker Compose 시작
```bash
cd monitoring/apm
docker-compose up -d
```

### 2. 접속
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - ID: `test`
  - PW: `test`

### 3. 자동 설정 확인 ✅
Docker 시작 시 **자동으로 설정됨**:
- ✅ Prometheus Data Source 자동 연결
- ✅ 로그인 후 바로 사용 가능

### 4. 대시보드 Import (선택)
- **Spring Boot Dashboard**: ID `11378`
- **JVM Dashboard**: ID `4701`

Dashboards > Import > Import via grafana.com에서 ID 입력

## 종료
```bash
docker-compose down
```

## 데이터 초기화
```bash
docker-compose down -v  # 볼륨까지 삭제
```

## 주의사항
- Prometheus는 `host.docker.internal:8080`으로 Spring Boot 앱에 접근
- Windows/Mac: 자동 지원
- Linux: `--add-host=host.docker.internal:host-gateway` 옵션 필요
