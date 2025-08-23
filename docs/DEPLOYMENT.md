# 🚀 배포 가이드

## GitHub Secrets 설정

CI/CD가 제대로 작동하려면 다음 GitHub Secrets를 설정해야 합니다.

### Repository Settings > Secrets and variables > Actions

#### 백엔드 배포용 (Vercel)
- `VERCEL_TOKEN`: Vercel API 토큰
- `ORG_ID`: Vercel 조직 ID
- `PROJECT_ID`: Vercel 프로젝트 ID

#### 프론트엔드 빌드용
- `VITE_API_URL`: 백엔드 API URL (예: https://getit-stock-game.vercel.app/api)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `VITE_KAKAO_CLIENT_ID`: Kakao OAuth 클라이언트 ID

## Vercel 설정

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 프로젝트 연결
```bash
cd stockGame-be
vercel
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정:
```
CORS_ORIGIN=https://kimjhyun0627.github.io,https://getit-stock-game.vercel.app
JWT_SECRET=your-secret-key
```

## GitHub Pages 설정

### 1. Repository Settings > Pages
- Source: GitHub Actions
- Branch: main

### 2. Actions 권한 설정
- Repository Settings > Actions > General
- Workflow permissions: "Read and write permissions" 선택

## 배포 확인

### CI/CD 파이프라인
1. 코드를 `main` 브랜치에 푸시
2. GitHub Actions에서 CI 파이프라인 실행 확인
3. CI 성공 시 자동으로 배포 워크플로우 실행
4. 배포 완료 확인

### 수동 배포 테스트
```bash
# 백엔드
cd stockGame-be
npm run build
vercel --prod

# 프론트엔드
cd stockGame-fe
npm run build
# dist 폴더를 웹 서버에 업로드
```

## 문제 해결

### CORS 오류
- Vercel의 환경 변수 `CORS_ORIGIN` 확인
- 프론트엔드 도메인이 허용 목록에 포함되어 있는지 확인

### 배포 실패
- GitHub Secrets 설정 확인
- Vercel 프로젝트 ID 및 토큰 확인
- Actions 권한 설정 확인

### 빌드 실패
- Node.js 버전 확인 (18.x 권장)
- 의존성 설치 오류 확인
- 환경 변수 누락 확인
