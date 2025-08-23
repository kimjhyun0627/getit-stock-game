# STOCK IT - Frontend

GETIT 모의 투자 게임의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Navigation.tsx  # 네비게이션 바
│   ├── NewsModal.tsx   # 뉴스 모달
│   ├── StockCard.tsx   # 주식 카드
│   ├── StockPriceBoard.tsx # 주식 가격 보드
│   ├── LoadingSpinner.tsx  # 로딩 스피너
│   ├── PageTransition.tsx  # 페이지 전환 애니메이션
│   └── ...
├── pages/              # 페이지 컴포넌트
│   ├── Home.tsx        # 홈 화면
│   ├── Buy.tsx         # 매수 페이지
│   ├── Sell.tsx        # 매도 페이지
│   ├── Portfolio.tsx   # 포트폴리오 페이지
│   ├── News.tsx        # 뉴스 페이지
│   ├── Leaderboard.tsx # 리더보드 페이지
│   ├── Admin.tsx       # 관리자 페이지
│   └── ...
├── utils/              # 유틸리티 함수
│   └── api.ts          # API 통신 함수
├── types/              # TypeScript 타입 정의
├── assets/             # 정적 자산 (이미지, 아이콘)
└── App.tsx             # 메인 앱 컴포넌트
```

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치
```bash
# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
# 개발 모드로 실행 (포트 5173)
npm run dev
```

### 프로덕션 빌드
```bash
# 프로덕션용 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🔧 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# 백엔드 API URL
VITE_API_URL=http://localhost:3000

# OAuth 설정 (선택사항)
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🌟 주요 기능

### 🏠 홈 화면
- 실시간 주식 가격 표시
- 뉴스 카드 클릭 시 모달로 전체 내용 표시
- 리더보드 버튼으로 빠른 접근
- 거래량을 K, M 단위로 포맷팅

### 📈 주식 거래
- **매수**: 보유 자금 내에서 주식 구매
- **매도**: 보유 주식 판매
- 실시간 거래량 업데이트

### 📊 포트폴리오
- 보유 주식 현황
- 수익률 계산
- 거래 내역

### 📰 뉴스
- 주식별 뉴스 카테고리
- 관리자용 뉴스 작성/편집
- 게시 상태 관리

### 🏆 리더보드
- 사용자별 수익률 순위
- 관리자 숨김/보이기 기능
- 1-3등 트로피 아이콘, 4등 이하 #4 형태 표시

### 👑 관리자 기능
- 사용자 권한 관리 (일반 사용자 ↔ 관리자)
- 주식 생성/관리
- 뉴스 작성/편집
- 리더보드 새로고침

## 🔐 인증

### 지원하는 로그인 방식
- **카카오 OAuth**: 카카오 계정으로 로그인
- **구글 OAuth**: 구글 계정으로 로그인

### 권한 관리
- **일반 사용자**: 기본 거래 및 조회 기능
- **관리자**: 모든 기능 + 관리자 전용 기능

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 지원
- Tailwind CSS를 활용한 반응형 레이아웃
- 터치 친화적인 UI/UX

## 🎨 UI/UX 특징

- 그라데이션 배경과 모던한 디자인
- 부드러운 페이지 전환 애니메이션
- 호버 효과와 인터랙션
- 로딩 상태 표시

## 🔌 API 통신

- `apiFetch` 유틸리티를 통한 일관된 API 호출
- JWT 토큰 기반 인증
- 에러 핸들링 및 사용자 피드백

## 📦 주요 패키지

```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "vite": "^4.0.0",
  "lucide-react": "^0.263.0"
}
```

## 🚀 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Netlify 배포
```bash
# 빌드
npm run build

# dist 폴더를 Netlify에 업로드
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**STOCK IT** - GETIT 모의 투자 게임 🚀
