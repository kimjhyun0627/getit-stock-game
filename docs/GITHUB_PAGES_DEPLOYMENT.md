# 🚀 GitHub Pages 배포 가이드

## 📋 개요

이 가이드는 STOCK IT 게임의 프론트엔드를 GitHub Pages에 배포하는 방법을 설명합니다.

## ⚠️ 주의사항

**GitHub Pages는 정적 사이트만 호스팅할 수 있습니다.** 백엔드 API는 별도로 호스팅해야 합니다.

## 🔧 사전 준비

### 1. GitHub 저장소 설정

1. **GitHub 저장소 생성**
   - 저장소 이름: `stockGame` (또는 원하는 이름)
   - Public 또는 Private 선택

2. **프로젝트 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/stockGame.git
   git push -u origin main
   ```

### 2. GitHub Pages 설정

1. **Settings → Pages**로 이동
2. **Source**를 **GitHub Actions**로 설정
3. **Actions → General**에서 **Workflow permissions**를 **Read and write permissions**로 설정

## 🚀 배포 과정

### 1. 자동 배포 (권장)

GitHub Actions가 자동으로 배포를 처리합니다:

1. **main 브랜치에 푸시**
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```

2. **Actions 탭에서 진행 상황 확인**
   - `.github/workflows/deploy-frontend.yml` 워크플로우 실행
   - 빌드 및 배포 과정 모니터링

3. **배포 완료 확인**
   - Actions에서 "Deploy to GitHub Pages" 단계 완료
   - 배포된 URL 확인: `https://your-username.github.io/stockGame-fe/`

### 2. 수동 배포

GitHub Actions 탭에서 **workflow_dispatch**를 통해 수동으로 배포할 수 있습니다.

## ⚙️ 환경변수 설정

### 프로덕션 환경변수

`.env.production` 파일을 생성하여 프로덕션 환경을 설정하세요:

```bash
# .env.production
VITE_API_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

**⚠️ 중요**: `.env.production` 파일은 절대 Git에 커밋하지 마세요!

### 환경변수 파일 관리

```bash
# .gitignore에 추가
.env.production
.env.local
.env.*.local
```

## 🔍 배포 확인

### 1. 배포 상태 확인

- **GitHub 저장소 → Actions**: 워크플로우 실행 상태
- **GitHub 저장소 → Settings → Pages**: 배포된 사이트 URL

### 2. 사이트 접속 테스트

배포된 URL에 접속하여 다음을 확인하세요:
- [ ] 페이지가 정상적으로 로드됨
- [ ] 스타일이 제대로 적용됨
- [ ] API 호출이 정상적으로 작동함
- [ ] OAuth 로그인이 정상적으로 작동함

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 빌드 실패
```bash
# 로컬에서 빌드 테스트
cd stockGame-fe
npm run build
```

#### 2. 404 에러
- `vite.config.ts`의 `base` 설정 확인
- GitHub 저장소 이름과 일치하는지 확인

#### 3. API 연결 실패
- `VITE_API_URL` 환경변수가 올바르게 설정되었는지 확인
- 백엔드 서버가 실행 중인지 확인

#### 4. 스타일이 적용되지 않음
- Tailwind CSS 빌드 확인
- CSS 파일이 제대로 생성되었는지 확인

### 로그 확인

1. **GitHub Actions 로그**
   - Actions 탭에서 워크플로우 클릭
   - 각 단계별 로그 확인

2. **브라우저 개발자 도구**
   - Console 탭에서 에러 메시지 확인
   - Network 탭에서 API 호출 상태 확인

## 📱 모바일 테스트

GitHub Pages에 배포된 사이트를 모바일에서 테스트하세요:
- [ ] 반응형 디자인이 제대로 작동함
- [ ] 터치 인터페이스가 정상적으로 작동함
- [ ] 모바일 브라우저에서 모든 기능이 정상적으로 작동함

## 🔄 업데이트 배포

프론트엔드 코드를 수정한 후:

1. **변경사항 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **자동 배포 대기**
   - GitHub Actions가 자동으로 새 버전을 배포
   - 배포 완료까지 약 2-5분 소요

## 🌐 커스텀 도메인 (선택사항)

GitHub Pages에 커스텀 도메인을 연결할 수 있습니다:

1. **Settings → Pages → Custom domain**
2. 도메인 입력 (예: `stockgame.yourdomain.com`)
3. DNS 설정에서 CNAME 레코드 추가
4. **Enforce HTTPS** 체크

## 📊 모니터링

### 배포 상태 모니터링

- **GitHub Actions**: 자동 배포 상태
- **GitHub Pages**: 사이트 상태 및 성능
- **외부 모니터링 도구**: UptimeRobot, Pingdom 등

### 성능 최적화

- **Lighthouse**: 성능, 접근성, SEO 점수 확인
- **Bundle 분석**: `npm run build` 후 번들 크기 확인
- **이미지 최적화**: WebP 형식 사용, 적절한 크기로 리사이징

## 🎯 다음 단계

프론트엔드 배포가 완료되면:

1. **백엔드 배포**: 별도 서버에 백엔드 API 배포
2. **도메인 연결**: 커스텀 도메인 설정
3. **SSL 인증서**: HTTPS 설정
4. **CDN 설정**: Cloudflare 등으로 성능 향상
5. **모니터링**: 에러 추적 및 성능 모니터링 설정

---

**🚀 GitHub Pages 배포가 완료되었습니다!**

배포된 사이트: `https://your-username.github.io/stockGame-fe/`
