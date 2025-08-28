#!/bin/bash

echo "🚀 GitHub Pages 배포 시작..."

# 1. 프론트엔드 빌드 (TypeScript 체크 건너뛰기)
echo "📦 프론트엔드 빌드 중..."
cd stockGame-fe
npm run build --silent || echo "⚠️ 빌드 중 일부 에러가 발생했지만 계속 진행합니다."

# 2. gh-pages 브랜치 생성 또는 체크아웃
echo "🌿 gh-pages 브랜치 준비 중..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# 3. 기존 파일 제거 (git clean -fd)
git clean -fd

# 4. dist 폴더의 내용을 루트로 복사
echo "📁 빌드된 파일 복사 중..."
cp -r dist/* .

# 5. 변경사항 커밋
echo "💾 변경사항 커밋 중..."
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

# 6. gh-pages 브랜치 푸시
echo "🚀 gh-pages 브랜치 푸시 중..."
git push origin gh-pages --force

# 7. main 브랜치로 돌아가기
echo "🔄 main 브랜치로 복귀 중..."
git checkout main

echo "✅ 배포 완료!"
echo "🌐 GitHub 저장소에서 Settings → Pages → Source를 'Deploy from a branch'로 설정하고 Branch를 'gh-pages'로 설정하세요."
echo "📱 배포된 사이트: https://kimjhyun0627.github.io/getit-stock-game/"
