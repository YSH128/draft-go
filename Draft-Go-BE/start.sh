#!/bin/bash
set -e

ENV_FILE="/etc/draft-go/Draft-Go-BE.env"
PID_FILE="app.pid"
LOG_FILE="app.log"
HEALTH_URL="http://localhost:8080/actuator/health"

echo "✅ Loading env from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

JAR=$(ls build/libs/*SNAPSHOT.jar)

echo "🚀 Starting application..."
nohup java -jar "$JAR" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

PID=$(cat "$PID_FILE")
echo "🕐 Waiting for application to be healthy (PID=$PID)..."

# 최대 30초 대기
for i in {1..30}; do
  sleep 1

  if ! ps -p "$PID" > /dev/null; then
    echo "❌ Application process exited unexpectedly"
    tail -n 50 "$LOG_FILE"
    exit 1
  fi

  if curl -sf "$HEALTH_URL" | grep -q '"status":"UP"'; then
    echo "✅ Application is UP"
    exit 0
  fi
done

echo "❌ Application did not become healthy in time"
tail -n 50 "$LOG_FILE"
kill -15 "$PID"
exit 1
