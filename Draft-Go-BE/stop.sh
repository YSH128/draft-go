#!/bin/bash

echo "🛑 Stop existing server..."

PID=$(lsof -ti :8080)

if [ -z "$PID" ]; then
  echo "⚠️ No process running on port 8080"
else
  echo "🔥 Killing process on port 8080 (PID=$PID)"
  kill -9 $PID
fi

echo "✅ Stop completed"
