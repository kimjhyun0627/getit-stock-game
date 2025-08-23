# STOCK IT - Backend

GETIT 모의 투자 게임의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: SQLite (TypeORM)
- **Authentication**: JWT + Passport.js
- **OAuth**: Kakao, Google
- **Validation**: class-validator
- **Scheduling**: @nestjs/schedule (Cron)
- **Package Manager**: npm

## 📁 프로젝트 구조

```
src/
├── auth/                 # 인증 관련 모듈
│   ├── controllers/      # 인증 컨트롤러
│   ├── services/        # 인증 서비스
│   ├── guards/          # 인증 가드
│   └── strategies/      # Passport 전략
├── common/               # 공통 모듈
│   ├── entities/        # 공통 엔티티
│   ├── dto/             # 공통 DTO
│   └── guards/          # 공통 가드
├── config/               # 설정
│   └── configuration.ts  # 환경 설정
├── modules/              # 비즈니스 모듈
│   ├── stocks/          # 주식 관리
│   ├── news/            # 뉴스 관리
│   ├── portfolios/      # 포트폴리오/거래 관리
│   ├── leaderboard/     # 리더보드 관리
│   └── admin/           # 관리자 기능
├── users/                # 사용자 관리
├── seed/                 # 초기 데이터 시드
├── app.module.ts         # 메인 모듈
└── main.ts               # 애플리케이션 진입점
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
# 개발 모드로 실행 (포트 3000)
npm run start:dev

# 프로덕션 모드로 실행
npm run start:prod

# 디버그 모드로 실행
npm run start:debug
```

### 데이터베이스 마이그레이션

```bash
# TypeORM 마이그레이션 실행
npm run typeorm:run

# 스키마 동기화 (개발용)
npm run typeorm:sync
```

### 초기 데이터 시드

```bash
# 초기 데이터 생성
npm run seed
```

## 🔧 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=stockgame

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 🌟 주요 기능

### 🔐 인증 시스템

- **JWT 기반 인증**: 토큰 기반 사용자 인증
- **OAuth 지원**: 카카오, 구글 로그인
- **권한 관리**: 일반 사용자, 관리자 역할 구분
- **가드 시스템**: 라우트별 접근 제어

### 📊 주식 관리

- **주식 CRUD**: 생성, 조회, 수정, 삭제
- **실시간 가격**: 주기적 가격 업데이트
- **거래량 관리**: 매수/매도 시 자동 업데이트
- **가격 검증**: 유효한 가격 범위 검증

### 💰 포트폴리오 관리

- **거래 내역**: 매수/매도 기록 관리
- **잔액 관리**: 사용자별 보유 자금 관리
- **수익률 계산**: 실시간 수익률 계산
- **거래 검증**: 잔액 및 보유 주식 검증

### 📰 뉴스 시스템

- **뉴스 CRUD**: 관리자용 뉴스 작성/편집
- **카테고리 관리**: 주식별 뉴스 분류
- **게시 상태**: 게시/비게시 상태 관리
- **내용 검증**: 뉴스 내용 유효성 검증

### 🏆 리더보드 시스템

- **순위 계산**: 수익률 기반 순위 산정
- **가시성 관리**: 사용자별 표시/숨김 설정
- **실시간 업데이트**: 거래 시 자동 순위 재계산
- **관리자 기능**: 순위 새로고침 및 관리

### 👑 관리자 기능

- **사용자 권한 관리**: 일반 사용자 ↔ 관리자 전환
- **시스템 모니터링**: 전체 시스템 상태 확인
- **데이터 관리**: 주식, 뉴스, 사용자 데이터 관리

## 🔌 API 엔드포인트

### 인증

```
POST /api/auth/login          # 로그인
POST /api/auth/refresh        # 토큰 갱신
GET  /api/auth/kakao         # 카카오 OAuth
GET  /api/auth/google         # 구글 OAuth
```

### 사용자

```
GET  /api/users/me            # 현재 사용자 정보
PUT  /api/users/:id           # 사용자 정보 수정
POST /api/users/make-admin    # 관리자 권한 부여
```

### 주식

```
GET  /api/stocks              # 주식 목록 조회
POST /api/stocks              # 주식 생성 (관리자)
PUT  /api/stocks/:id          # 주식 정보 수정 (관리자)
DELETE /api/stocks/:id        # 주식 삭제 (관리자)
```

### 포트폴리오

```
GET  /api/portfolios          # 포트폴리오 조회
POST /api/portfolios/buy      # 주식 매수
POST /api/portfolios/sell     # 주식 매도
GET  /api/portfolios/transactions # 거래 내역
```

### 뉴스

```
GET  /api/news                # 뉴스 목록 조회
POST /api/news                # 뉴스 생성 (관리자)
PUT  /api/news/:id            # 뉴스 수정 (관리자)
DELETE /api/news/:id          # 뉴스 삭제 (관리자)
```

### 리더보드

```
GET  /api/leaderboard         # 공개 리더보드
GET  /api/leaderboard/admin   # 관리자용 리더보드
POST /api/leaderboard/admin/refresh # 리더보드 새로고침
POST /api/leaderboard/admin/toggle-visibility # 사용자 가시성 토글
```

## 🗄️ 데이터베이스 스키마

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

## 🔒 보안 기능

### 인증 및 권한

- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (RBAC)
- API 엔드포인트 보호

### 데이터 검증

- DTO 기반 입력 검증
- SQL 인젝션 방지 (TypeORM)
- XSS 공격 방지

### 환경 변수 관리

- 민감한 정보 환경 변수 분리
- 설정 파일 암호화
- 프로덕션 환경 보안 강화

## 📊 성능 최적화

### 데이터베이스

- 인덱스 최적화
- 쿼리 최적화
- 연결 풀 관리

### 캐싱

- 메모리 캐싱
- Redis 캐싱 (선택사항)
- 응답 캐싱

### 스케줄링

- Cron 작업 최적화
- 백그라운드 작업 관리
- 리소스 사용량 모니터링

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov

# 테스트 디버그
npm run test:debug
```

## 📦 주요 패키지

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/schedule": "^4.0.0",
  "typeorm": "^0.3.0",
  "passport": "^0.7.0",
  "class-validator": "^0.14.0",
  "sqlite3": "^5.1.0"
}
```

## 🚀 배포

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### PM2 배포

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start dist/main.js --name "stockgame-api"

# 프로세스 모니터링
pm2 monit
```

### Nginx 리버스 프록시

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 모니터링 및 로깅

### 로깅

- Winston 기반 구조화된 로깅
- 로그 레벨별 관리
- 파일 및 콘솔 출력

### 모니터링

- 헬스 체크 엔드포인트
- 성능 메트릭 수집
- 에러 추적 및 알림

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

**STOCK IT** - GETIT 모의 투자 게임 백엔드 🚀
