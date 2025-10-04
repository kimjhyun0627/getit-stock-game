# STOCK IT - GETIT 모의 투자 게임

경북대학교 컴퓨터학부 SW/창업동아리 GETIT에서 진행하는 모의 투자 게임 프로젝트입니다. 실시간 주식 시세, 뉴스, 포트폴리오 관리, 리더보드 등 다양한 기능을 제공합니다.

## 🏗️ 프로젝트 구조

```
stockGame/
├── stockGame-fe/          # 프론트엔드 (React + TypeScript)
├── stockGame-be/          # 백엔드 (NestJS + TypeScript)
└── README.md              # 이 파일
```

## 🚀 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **State Management**: React Hooks

### Backend
- **Framework**: NestJS 10 + TypeScript
- **Database**: SQLite (TypeORM)
- **Authentication**: JWT + Passport.js
- **OAuth**: Kakao, Google
- **Validation**: class-validator

## 🌟 주요 기능

### 📊 주식 거래
- 실시간 주식 가격 모니터링
- 매수/매도 기능
- 포트폴리오 관리
- 거래 내역 추적

### 📰 뉴스 시스템
- 주식별 뉴스 카테고리
- 관리자용 뉴스 작성/편집
- 게시 상태 관리

### 🏆 리더보드
- 사용자별 수익률 순위
- 관리자 숨김/보이기 기능
- 실시간 순위 업데이트

### 👑 관리자 기능
- 사용자 권한 관리
- 주식 생성/관리
- 뉴스 관리
- 시스템 모니터링

### 🔐 인증 시스템
- 카카오 OAuth 로그인
- 구글 OAuth 로그인
- JWT 기반 인증
- 역할 기반 접근 제어

## 🛠️ 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd stockGame
```

### 2. 백엔드 실행
```bash
cd stockGame-be
npm install
npm run start:dev
```

### 3. 프론트엔드 실행
```bash
cd stockGame-fe
npm install
npm run dev
```

### 4. 브라우저에서 확인
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🔧 환경 설정

### 백엔드 환경변수
`stockGame-be/.env` 파일을 생성하고 다음을 설정하세요:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 프론트엔드 환경변수
`stockGame-fe/.env` 파일을 생성하고 다음을 설정하세요:

```env
# 백엔드 API URL
VITE_API_URL=http://localhost:3000

# OAuth 설정 (선택사항)
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📱 주요 페이지

### 🏠 홈 화면
- 실시간 주식 가격 표시
- 뉴스 카드 클릭 시 모달로 전체 내용 표시
- 리더보드 버튼으로 빠른 접근
- 거래량을 K, M 단위로 포맷팅

### 📈 거래 페이지
- **매수**: 보유 자금 내에서 주식 구매
- **매도**: 보유 주식 판매
- 실시간 거래량 업데이트

### 📊 포트폴리오
- 보유 주식 현황
- 수익률 계산
- 거래 내역

### 🏆 리더보드
- 사용자별 수익률 순위
- 1-3등 트로피 아이콘, 4등 이하 #4 형태 표시

## 🔌 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/kakao` - 카카오 OAuth
- `GET /api/auth/google` - 구글 OAuth

### 주식
- `GET /api/stocks` - 주식 목록 조회
- `POST /api/stocks` - 주식 생성 (관리자)
- `PUT /api/stocks/:id` - 주식 정보 수정 (관리자)

### 포트폴리오
- `GET /api/portfolios` - 포트폴리오 조회
- `POST /api/portfolios/buy` - 주식 매수
- `POST /api/portfolios/sell` - 주식 매도

### 뉴스
- `GET /api/news` - 뉴스 목록 조회
- `POST /api/news` - 뉴스 생성 (관리자)
- `PUT /api/news/:id` - 뉴스 수정 (관리자)

### 리더보드
- `GET /api/leaderboard` - 공개 리더보드
- `GET /api/leaderboard/admin` - 관리자용 리더보드

## 🗄️ 데이터베이스

### 주요 엔티티
- **User**: 사용자 정보, 권한, 잔액
- **Stock**: 주식 정보, 가격, 거래량
- **Transaction**: 거래 내역, 매수/매도 기록
- **News**: 뉴스 정보, 카테고리, 게시 상태
- **LeaderboardEntry**: 리더보드 항목, 순위, 가시성

### 관계
- User ↔ Transaction (1:N)
- Stock ↔ Transaction (1:N)
- Stock ↔ News (1:N)

## 🚀 배포

### 백엔드 배포
```bash
cd stockGame-be
npm run build
npm run start:prod
```

### 프론트엔드 배포
```bash
cd stockGame-fe
npm run build
# dist 폴더를 웹 서버에 업로드
```

### Docker 배포
각 디렉토리에 Dockerfile이 포함되어 있습니다.

## 🧪 테스트

### 백엔드 테스트
```bash
cd stockGame-be
npm run test
npm run test:e2e
```

### 프론트엔드 테스트
```bash
cd stockGame-fe
npm run test
```

## 📚 상세 문서

- [프론트엔드 문서](./stockGame-fe/README.md)
- [백엔드 문서](./stockGame-be/README.md)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**STOCK IT** - GETIT 모의 투자 게임 🚀

> 교육 및 학습 목적으로 제작된 모의 투자 게임입니다.
