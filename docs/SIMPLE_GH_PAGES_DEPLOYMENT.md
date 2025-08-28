# 🚀 간단한 GitHub Pages 배포 가이드

## 📋 개요

GitHub Actions 없이도 GitHub Pages에 배포할 수 있습니다. 이 가이드는 더 간단한 방법들을 설명합니다.

## 🎯 방법 1: 자동 배포 스크립트 사용 (권장)

### 1. 배포 스크립트 실행
```bash
./deploy-gh-pages.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- 프론트엔드 빌드
- gh-pages 브랜치 생성
- 빌드된 파일을 gh-pages 브랜치에 복사
- GitHub에 푸시

### 2. GitHub 설정
1. **GitHub 저장소** → **Settings** → **Pages**
2. **Source**를 **Deploy from a branch**로 설정
3. **Branch**를 `gh-pages`로 설정
4. **Save** 클릭

## 🎯 방법 2: 수동 배포

### 1. 프론트엔드 빌드
```bash
cd stockGame-fe
npm run build
```

### 2. gh-pages 브랜치 생성
```bash
cd ..
git checkout -b gh-pages
```

### 3. 빌드된 파일 복사
```bash
cp -r stockGame-fe/dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
```

### 4. 푸시
```bash
git push origin gh-pages
```

### 5. main 브랜치로 복귀
```bash
git checkout main
```

## 🎯 방법 3: GitHub Desktop 사용

1. **GitHub Desktop**에서 저장소 열기
2. **Branch** → **New Branch** → `gh-pages` 생성
3. **stockGame-fe/dist** 폴더의 내용을 프로젝트 루트로 복사
4. **Commit to gh-pages** → **Push origin**
5. **Branch** → **main**으로 체크아웃

## ⚙️ 환경변수 설정

### 프로덕션 환경변수
`.env.production` 파일을 생성하세요:
```bash
VITE_API_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

**⚠️ 중요**: `.env.production` 파일은 절대 Git에 커밋하지 마세요!

## 🔍 배포 확인

### 1. GitHub Pages 설정 확인
- **Settings** → **Pages**에서 배포 상태 확인
- **gh-pages** 브랜치가 선택되어 있는지 확인

### 2. 사이트 접속 테스트
배포된 URL에 접속하여 다음을 확인하세요:
- [ ] 페이지가 정상적으로 로드됨
- [ ] 스타일이 제대로 적용됨
- [ ] API 호출이 정상적으로 작동함

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 404 에러
- `vite.config.ts`의 `base` 설정이 `/getit-stock-game/`인지 확인
- GitHub 저장소 이름과 일치하는지 확인

#### 2. 스타일이 적용되지 않음
- CSS 파일이 제대로 생성되었는지 확인
- `dist` 폴더에 `assets` 폴더가 있는지 확인

#### 3. 빌드 실패
- TypeScript 에러가 있어도 `dist` 폴더가 생성되는지 확인
- `npm run build` 실행 후 `dist` 폴더 내용 확인

## 🔄 업데이트 배포

코드를 수정한 후:

1. **변경사항 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **배포 스크립트 실행**
   ```bash
   ./deploy-gh-pages.sh
   ```

## 🌐 배포된 URL

```
https://kimjhyun0627.github.io/getit-stock-game/
```

## 📱 모바일 테스트

배포된 사이트를 모바일에서 테스트하세요:
- [ ] 반응형 디자인이 제대로 작동함
- [ ] 터치 인터페이스가 정상적으로 작동함

## 🎯 장점

### GitHub Actions 대비 장점
- ✅ **간단함**: 복잡한 설정 불필요
- ✅ **빠름**: 즉시 배포 가능
- ✅ **직관적**: Git 브랜치 기반으로 이해하기 쉬움
- ✅ **안전함**: main 브랜치에 영향 없음

### 단점
- ❌ **수동**: 매번 스크립트 실행 필요
- ❌ **자동화 부족**: CI/CD 파이프라인 없음

## 🚀 다음 단계

프론트엔드 배포가 완료되면:

1. **백엔드 배포**: 별도 서버에 백엔드 API 배포
2. **도메인 연결**: 커스텀 도메인 설정
3. **SSL 인증서**: HTTPS 설정
4. **모니터링**: 사이트 상태 모니터링

---

**🚀 간단한 GitHub Pages 배포가 완료되었습니다!**

배포된 사이트: `https://kimjhyun0627.github.io/getit-stock-game/`
