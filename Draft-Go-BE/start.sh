#!/bin/bash

# =========================
# .env 로딩 (⭐ 핵심 추가)
# =========================
ENV_PATH="/var/lib/jenkins/draft-go/S14P11A205/.env"

if [ -f "$ENV_PATH" ]; then
    echo "Loading environment variables from .env"
    set -a
    source "$ENV_PATH"
    set +a
else
    echo "⚠️ .env file not found at $ENV_PATH"
fi

# =========================
# gradlew 실행 권한 부여
# =========================
chmod +x gradlew

# =========================
# 프로젝트 빌드 (테스트 제외)
# =========================
echo "Building project..."
./gradlew clean build -x test

if [ $? -ne 0 ]; then
    echo "Build failed."
    exit 1
fi

# =========================
# jar 파일 찾기
# =========================
JAR_PATH=$(find build/libs -name "*SNAPSHOT.jar" | head -n 1)

if [ -z "$JAR_PATH" ]; then
    echo "Error: JAR file not found in build/libs"
    exit 1
fi

echo "Found JAR: $JAR_PATH"
echo "Starting application..."

# =========================
# 애플리케이션 실행
# =========================
java -jar "$JAR_PATH"
