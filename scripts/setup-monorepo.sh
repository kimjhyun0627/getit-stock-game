#!/bin/bash

# STOCK IT Game Monorepo Setup Script
# 이 스크립트는 모노레포 구조를 설정하고 필요한 파일들을 생성합니다.

set -e

echo "🚀 STOCK IT Game Monorepo 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 디렉토리 이름 변경
print_status "디렉토리 이름을 변경합니다..."

if [ -d "stockGame-fe" ]; then
    mv stockGame-fe frontend
    print_success "stockGame-fe → frontend로 변경 완료"
elif [ -d "frontend" ]; then
    print_warning "frontend 디렉토리가 이미 존재합니다"
else
    print_error "stockGame-fe 디렉토리를 찾을 수 없습니다"
    exit 1
fi

if [ -d "stockGame-be" ]; then
    mv stockGame-be backend
    print_success "stockGame-be → backend로 변경 완료"
elif [ -d "backend" ]; then
    print_warning "backend 디렉토리가 이미 존재합니다"
else
    print_error "stockGame-be 디렉토리를 찾을 수 없습니다"
    exit 1
fi

# 2. 필요한 디렉토리 생성
print_status "필요한 디렉토리를 생성합니다..."

mkdir -p docs
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p data
mkdir -p logs

print_success "디렉토리 생성 완료"

# 3. 루트 의존성 설치
print_status "루트 의존성을 설치합니다..."

if [ -f "package.json" ]; then
    npm install
    print_success "루트 의존성 설치 완료"
else
    print_error "package.json 파일을 찾을 수 없습니다"
    exit 1
fi

# 4. 모든 워크스페이스 의존성 설치
print_status "모든 워크스페이스 의존성을 설치합니다..."

npm run install:all

print_success "모든 의존성 설치 완료"

# 5. 환경변수 파일 설정
print_status "환경변수 파일을 설정합니다..."

if [ ! -f "backend/.env" ]; then
    if [ -f "env.example" ]; then
        cp env.example backend/.env
        print_success "백엔드 .env 파일 생성 완료"
        print_warning "backend/.env 파일을 편집하여 실제 값으로 설정하세요"
    else
        print_warning "env.example 파일이 없습니다"
    fi
else
    print_warning "backend/.env 파일이 이미 존재합니다"
fi

# 6. Git 설정
print_status "Git 설정을 확인합니다..."

if [ -d ".git" ]; then
    print_success "Git 저장소가 이미 초기화되어 있습니다"
else
    print_status "Git 저장소를 초기화합니다..."
    git init
    print_success "Git 저장소 초기화 완료"
fi

# 7. 권한 설정
print_status "스크립트 파일에 실행 권한을 부여합니다..."

chmod +x scripts/*.sh 2>/dev/null || true

print_success "권한 설정 완료"

# 8. 최종 확인
print_status "설정 완료 확인 중..."

echo ""
echo "📁 현재 프로젝트 구조:"
tree -L 2 -I 'node_modules|dist|build|.git' || echo "tree 명령어가 설치되지 않았습니다. 'ls -la'를 사용하세요"

echo ""
print_success "🎉 STOCK IT Game Monorepo 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. backend/.env 파일을 편집하여 환경변수를 설정하세요"
echo "2. frontend/.env 파일을 생성하여 환경변수를 설정하세요"
echo "3. 'npm run dev' 명령어로 개발 서버를 실행하세요"
echo "4. Git에 변경사항을 커밋하고 GitHub에 푸시하세요"
echo ""
echo "🔧 유용한 명령어:"
echo "- npm run dev          : 프론트엔드와 백엔드 동시 실행"
echo "- npm run dev:frontend : 프론트엔드만 실행"
echo "- npm run dev:backend  : 백엔드만 실행"
echo "- npm run build        : 전체 프로젝트 빌드"
echo "- npm run test         : 전체 테스트 실행"
echo ""
echo "🐳 Docker 사용:"
echo "- docker-compose up    : 전체 서비스 실행"
echo "- docker-compose up --profile dev : 개발 모드로 실행"
echo ""
echo "🚀 GitHub 업로드:"
echo "git add ."
echo "git commit -m 'Initial commit: STOCK IT Game Monorepo'"
echo "git remote add origin https://github.com/username/stock-it-game.git"
echo "git push -u origin main"
