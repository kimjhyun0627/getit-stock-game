# STOCK IT - GETIT 모의 투자 게임

경북대학교 컴퓨터학부 SW/창업동아리 GETIT에서 진행하는 모의 투자 게임 프로젝트입니다. 실시간 주식 시세, 뉴스, 포트폴리오 관리, 리더보드 등 다양한 기능을 제공합니다.

## 🏗️ 프로젝트 구조

```
stockGame/
├── stockGame-fe/          # 프론트엔드 (React + TypeScript)
├── stockGame-be/          # 백엔드 (Spring Boot + Java 17)
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
- **Framework**: Spring Boot 3.2 + Java 17
- **Database**: MySQL (Docker) / SQLite (로컬 개발)
- **Authentication**: JWT, Spring Security
- **OAuth**: Kakao, Google
- **Validation**: Bean Validation

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

### Docker Compose로 한 번에 실행 (권장)

프론트엔드, 백엔드(Spring Boot), MySQL이 함께 올라갑니다. Nginx가 80 포트에서 프론트를 서빙하고 `/api`를 백엔드로 프록시합니다.

```bash
cd stockGame
docker compose up -d --build
```

- **접속**: http://localhost (포트 80)
- **MySQL**: localhost:3306 (root 비밀번호 기본값 `stockgame`, DB `stockgame`)

환경 변수는 **프로젝트 루트**에 `.env`를 두고 사용합니다. 예시는 `env.sample`을 참고하세요. (복사 후 `.env`로 저장해 값만 채우면 됩니다.)

```bash
cp env.sample .env
# .env 편집 후
docker compose up -d --build
```

OAuth 콜백 URL은 로컬 기준 `http://localhost/api/auth/kakao/callback`, `http://localhost/api/auth/google/callback` 로 설정하세요.

### 로컬 개발 (Docker 없이)

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd stockGame
```

#### 2. 백엔드 실행
```bash
cd stockGame-be
mvn spring-boot:run
```
(기본값: SQLite 사용. Docker MySQL 쓰려면 `SPRING_PROFILES_ACTIVE=docker` 및 `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` 설정)

#### 3. 프론트엔드 실행
```bash
cd stockGame-fe
npm install
npm run dev
```

#### 4. 브라우저에서 확인
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🔧 환경 설정

### 백엔드 환경변수
`stockGame-be`는 `application.yml` 및 환경 변수로 설정합니다. Docker 외 로컬에서는 기본값(SQLite)이 적용됩니다.

```env
# 서버
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 프론트엔드 환경변수
- **Docker·배포**: 프론트엔드는 상대 경로 `/api`를 사용하므로 **.env 없이** 동작합니다. Nginx(또는 리버스 프록시)가 `/api`를 백엔드로 넘기면 됩니다.
- **로컬 npm run dev**: 필요 시 `stockGame-fe/.env.local`을 만들어 `VITE_API_URL=/api` 등만 넣으면 됩니다 (없으면 코드 기본값 `/api` + Vite 프록시 사용).

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
mvn package -DskipTests
java -jar target/stockgame-be-1.0.0.jar
```

### 프론트엔드 배포
```bash
cd stockGame-fe
npm run build
# dist 폴더를 웹 서버에 업로드
```

### Docker 배포 (로컬·배포 동일)
배포 서버에서도 같은 Docker Compose로 실행합니다.

1. **저장소 클론** 후 프로젝트 루트로 이동
2. **환경 변수**: `env.sample`을 복사해 `.env`로 저장하고, 배포용 값으로 수정 (DB 비밀번호, JWT_SECRET, OAuth 키, `FRONTEND_URL`·OAuth 콜백 URL을 실제 도메인으로)
3. **실행**: `docker compose up -d --build`

- **프론트엔드**: 이미지에 API 경로가 `/api`로 고정되어 있어 별도 .env 불필요. 서버 Nginx(또는 리버스 프록시)에서 `/api`만 백엔드로 넘기면 됩니다.
- **백엔드·MySQL**: 설정은 모두 루트의 `.env`에서 읽습니다. `.env`는 Git에 넣지 마세요.

## 🧪 테스트

### 백엔드 테스트
```bash
cd stockGame-be
mvn test
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
