#!/bin/bash
set -e

ENV_FILE="/etc/draft-go/Draft-Go-BE.env"

echo "✅ Loading env from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

JAR=$(ls build/libs/*SNAPSHOT.jar)

echo "🚀 Starting application..."

nohup java -jar "$JAR" > app.log 2>&1 &
echo $! > app.pid

echo "✅ Application started (PID=$(cat app.pid))"
