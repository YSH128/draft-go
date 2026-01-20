#!/bin/bash

# gradlew 실행 권한 부여
chmod +x gradlew

# 프로젝트 빌드 (테스트 제외)
echo "Building project..."
./gradlew clean build -x test

# 빌드 결과 확인
if [ $? -ne 0 ]; then
    echo "Build failed."
    exit 1
fi

# jar 파일 찾기 (SNAPSHOT 버전 포함)
JAR_PATH=$(find build/libs -name "*SNAPSHOT.jar" | head -n 1)

if [ -z "$JAR_PATH" ]; then
    echo "Error: JAR file not found in build/libs"
    exit 1
fi

echo "Found JAR: $JAR_PATH"
echo "Starting application..."

# 애플리케이션 실행
java -jar $JAR_PATH
