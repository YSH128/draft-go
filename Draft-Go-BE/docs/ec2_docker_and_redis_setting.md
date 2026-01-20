# 1️⃣EC2에 Redis/Docker 설치 및 실행

## 1) Docker 설치
```bash
# Docker 설치 스크립트 다운로드
curl -fsSL https://get.docker.com -o get-docker.sh
# Docker 설치
sudo sh get-docker.sh
docker --version
# docker 실행 권한 부여(실행 후 재시도)
sudo usermod -aG docker $USER
```
## 2) Redis 설치 및 실행
```bash
docker run -d \
--name my-redis \
-p 6379:6379 \
--restart always \
-v ~/redis-data:/data \
redis:alpine
```
# 2️⃣ 로컬에서 Redis Insight 사용 방법

## 1) Redis Insight 다운로드
https://redis.io/downloads/#Redis_Insight

## 2) ssh 터널링
```bash
ssh -i ".\I14A205T.pem" -L 6379:localhost:6379 ubuntu@draft-go.com
```

## 3) localhost:6379로 EC2 내부 Redis 접속
끝