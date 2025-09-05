t#!/bin/bash

# Docker로 주식게임 백엔드 실행 스크립트

echo "🐳 주식게임 백엔드 Docker 빌드 및 실행"

# 1. 빌드
echo "📦 애플리케이션 빌드 중..."
npm run build

# 2. Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker build -t stockgame-backend .

# 3. 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker stop stockgame-backend 2>/dev/null || true
docker rm stockgame-backend 2>/dev/null || true

# 4. 데이터 디렉토리 생성
mkdir -p ./data

# 5. Docker 컨테이너 실행
echo "🚀 Docker 컨테이너 실행 중..."
docker run -d \
  --name stockgame-backend \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/stockgame.db:/app/stockgame.db \
  --env-file .env \
  stockgame-backend

echo "✅ Docker 컨테이너가 실행되었습니다!"
echo "📊 API 엔드포인트: http://localhost:3000/api"
echo "🔍 로그 확인: docker logs -f stockgame-backend"
echo "⏹️  중지: docker stop stockgame-backend"
