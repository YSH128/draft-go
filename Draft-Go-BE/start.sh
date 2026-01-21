#!/bin/bash

ENV_PATH="/home/ubuntu/draft-go/S14P11A205/Draft-Go-BE/.env"

if [ ! -f "$ENV_PATH" ]; then
  echo "❌ .env not found: $ENV_PATH"
  exit 1
fi

echo "✅ Loading env from $ENV_PATH"
set -a
source "$ENV_PATH"
set +a

chmod +x gradlew

echo "Building project..."
./gradlew clean build -x test || exit 1

JAR_PATH=$(find build/libs -name "*SNAPSHOT.jar" | head -n 1)
[ -z "$JAR_PATH" ] && echo "❌ JAR not found" && exit 1

echo "Starting application..."
java -jar "$JAR_PATH"
