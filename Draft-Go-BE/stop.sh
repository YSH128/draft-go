#!/bin/bash

APP_NAME="draft-go"
PORT=8080

echo "🛑 Stop existing server..."

PID=$(lsof -ti tcp:${PORT})

if [ -z "$PID" ]; then
  echo "⚠️ No process running on port ${PORT}"
else
  echo "🔪 Killing PID ${PID}"
  kill -9 ${PID}
fi

echo "✅ Stop completed"
