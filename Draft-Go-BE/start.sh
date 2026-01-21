#!/bin/bash
set -e

ENV_FILE="/etc/draft-go/Draft-Go-BE.env"
PID_FILE="app.pid"
LOG_FILE="app.log"
PORT=8080
WAIT_SECONDS=40

echo "✅ Loading env from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

JAR=$(ls build/libs/*SNAPSHOT.jar | head -n 1)

echo "🚀 Starting application..."
nohup java -jar "$JAR" > "$LOG_FILE" 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"

echo "🕐 Waiting for server to open port $PORT (PID=$PID)..."

for i in $(seq 1 $WAIT_SECONDS); do
  sleep 1

  # 1️⃣ 프로세스 생존 확인
  if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "❌ Application process exited unexpectedly"
    tail -n 100 "$LOG_FILE"
    exit 1
  fi

  # 2️⃣ 포트 리스닝 확인 (가장 정확)
  if lsof -i TCP:$PORT -sTCP:LISTEN > /dev/null 2>&1; then
    echo "✅ Server is listening on port $PORT"
    exit 0
  fi
done

echo "❌ Server did not open port $PORT within ${WAIT_SECONDS}s"
tail -n 100 "$LOG_FILE"
kill -15 "$PID"
exit 1
