#!/bin/bash

PID_FILE="app.pid"

echo "🛑 Stop existing server..."

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p $PID > /dev/null; then
    kill -15 $PID
    echo "✅ Sent SIGTERM to PID $PID"
    sleep 3
  fi
  rm -f "$PID_FILE"
else
  echo "⚠️ No app.pid found"
fi

echo "✅ Stop completed"
