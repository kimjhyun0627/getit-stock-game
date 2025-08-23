# 🎮 주식게임 (Stock Game)

주식 거래를 시뮬레이션할 수 있는 웹 게임입니다.

## 🚀 배포 상태

- **백엔드**: [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://getit-stock-game.vercel.app)
- **프론트엔드**: [![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://kimjhyun0627.github.io/getit-stock-game)

## 🏗️ 프로젝트 구조

```
stockGame/
├── stockGame-be/          # NestJS 백엔드
├── stockGame-fe/          # React 프론트엔드
├── .github/workflows/     # GitHub Actions CI/CD
└── docs/                  # 프로젝트 문서
```

## 🔧 기술 스택

### 백엔드
- **Framework**: NestJS
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth (Google, Kakao)
- **Deployment**: Vercel

### 프론트엔드
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 🚀 CI/CD 파이프라인

### 자동화된 워크플로우
1. **CI Pipeline**: 코드 푸시 시 자동 테스트 및 빌드
2. **Backend Deployment**: CI 성공 시 Vercel에 자동 배포
3. **Frontend Deployment**: CI 성공 시 GitHub Pages에 자동 배포

### 트리거 조건
- `main` 또는 `develop` 브랜치에 푸시
- Pull Request 생성 시

## 🌐 CORS 설정

프로덕션 환경에서 다음 도메인들이 허용됩니다:
- `https://kimjhyun0627.github.io`
- `https://getit-stock-game.vercel.app`

## 📋 환경 변수 설정

### 백엔드 (.env)
```bash
# CORS 설정
CORS_ORIGIN=https://kimjhyun0627.github.io,https://getit-stock-game.vercel.app

# JWT 설정
JWT_SECRET=your-secret-key

# OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
KAKAO_CLIENT_ID=your-kakao-client-id
```

### 프론트엔드 (GitHub Secrets)
- `VITE_API_URL`: 백엔드 API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `VITE_KAKAO_CLIENT_ID`: Kakao OAuth 클라이언트 ID

## 🛠️ 로컬 개발

### 백엔드 실행
```bash
cd stockGame-be
npm install
npm run start:dev
```

### 프론트엔드 실행
```bash
cd stockGame-fe
npm install
npm run dev
```

## 📚 API 문서

자세한 API 문서는 [docs/API.md](docs/API.md)를 참조하세요.

## 🤝 기여하기

기여 가이드라인은 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)를 참조하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
