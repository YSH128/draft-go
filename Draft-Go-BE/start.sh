#!/bin/bash
set -e

ENV_FILE="/etc/draft-go/Draft-Go-BE.env"
PID_FILE="app.pid"
LOG_FILE="app.log"
PORT=8080

echo "✅ Loading env from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

JAR=$(ls build/libs/*SNAPSHOT.jar)

echo "🚀 Starting application..."
nohup java -jar "$JAR" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

PID=$(cat "$PID_FILE")
echo "🕐 Waiting for application to start (PID=$PID)..."

# 최대 30초 대기
for i in {1..30}; do
  sleep 1

  # 1️⃣ 프로세스가 죽었는지 확인
  if ! ps -p "$PID" > /dev/null; then
    echo "❌ Application process exited unexpectedly"
    tail -n 50 "$LOG_FILE"
    exit 1
  fi

  # 2️⃣ 포트 리스닝 확인 (핵심)
  if ss -lnt | grep -q ":$PORT "; then
    echo "✅ Server is listening on port $PORT"
    exit 0
  fi
done

echo "❌ Server did not open port $PORT in time"
tail -n 50 "$LOG_FILE"
kill -15 "$PID"
exit 1
