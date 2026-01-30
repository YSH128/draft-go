# Monitoring Infrastructure

Draft-Go 백엔드 모니터링 시스템

## 구성

### 📝 ELK Stack (Logs)
**목적:** 애플리케이션 로그 수집, 분석, 시각화

- **Elasticsearch**: 로그 저장 및 검색
- **Logstash**: 로그 수집 및 파싱
- **Kibana**: 로그 시각화

**사용 사례:**
- 에러 추적 및 디버깅
- 사용자 행동 분석
- 보안 이벤트 모니터링

📁 [elk/README.md](elk/README.md)

---

### 📊 APM (Metrics)
**목적:** 애플리케이션 성능 메트릭 수집 및 시각화

- **Prometheus**: 메트릭 수집 및 저장
- **Grafana**: 메트릭 대시보드

**사용 사례:**
- API 응답 시간 모니터링
- 시스템 리소스 사용률 추적
- 성능 병목 지점 발견

📁 [apm/README.md](apm/README.md)

---

## 빠른 시작

### ELK 시작
```bash
cd monitoring/elk
docker-compose up -d
```

### APM 시작
```bash
cd monitoring/apm
docker-compose up -d
```

### 전체 모니터링 시작
```bash
# PowerShell (Windows)
cd monitoring/elk && docker-compose up -d && cd ../apm && docker-compose up -d
```

## 접속 정보

| 서비스 | URL | 계정 |
|--------|-----|------|
| Kibana | http://localhost:5601 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin / admin |

## Observability 3 Pillars

```
관찰 가능성 (Observability)
│
├─ 📝 Logs (로그)
│  └─ ELK Stack
│     → "무슨 일이 일어났는가?"
│
├─ 📊 Metrics (메트릭)
│  └─ Prometheus + Grafana
│     → "얼마나 빠른가? 리소스는 충분한가?"
│
└─ 🔍 Traces (추적)
   └─ (향후 추가 예정)
      → "요청이 어떤 경로로 처리되었는가?"
```

## 로그 vs 메트릭

| | Logs (ELK) | Metrics (APM) |
|---|---|---|
| **데이터 형태** | 텍스트 이벤트 | 숫자 시계열 |
| **질문** | "왜 에러가 났지?" | "얼마나 느려졌지?" |
| **예시** | Stack trace, 에러 메시지 | 응답시간, CPU 사용률 |
| **저장소** | Elasticsearch | Prometheus |
| **시각화** | Kibana | Grafana |
