# 주식 게임 백엔드 (Spring Boot)

주식 게임 백엔드 (Spring Boot)입니다.

## 요구 사항

- Java 17+
- Maven 3.8+

## 설정

`src/main/resources/application.yml` 또는 환경 변수:

| 환경 변수 | 설명 | 기본값 |
|----------|------|--------|
| `PORT` | 서버 포트 | 3000 |
| `JWT_SECRET` | JWT 서명 시크릿 | (기본값 사용) |
| `JWT_ACCESS_EXPIRES_IN` | 액세스 토큰 만료 | 2h |
| `JWT_REFRESH_EXPIRES_IN` | 리프레시 토큰 만료 | 7d |
| `KAKAO_CLIENT_ID` | 카카오 OAuth 클라이언트 ID | - |
| `KAKAO_CLIENT_SECRET` | 카카오 OAuth 시크릿 | - |
| `KAKAO_REDIRECT_URI` | 카카오 콜백 URL | http://localhost:3000/api/auth/kakao/callback |
| `GOOGLE_CLIENT_ID` | 구글 OAuth 클라이언트 ID | - |
| `GOOGLE_CLIENT_SECRET` | 구글 OAuth 시크릿 | - |
| `GOOGLE_REDIRECT_URI` | 구글 콜백 URL | http://localhost:3000/api/auth/google/callback |
| `FRONTEND_URL` | 프론트엔드 URL (CORS, OAuth 리다이렉트) | http://localhost:5173 |

## 실행

```bash
mvn spring-boot:run
```

또는

```bash
mvn package -DskipTests
java -jar target/stockgame-be-1.0.0.jar
```

서버는 기본적으로 **http://localhost:3000** 에서 실행되며, API 베이스 경로는 **/api** 입니다.

## API 구조

- `GET/POST /api/auth/*` - 카카오/구글 로그인, 토큰 갱신
- `GET/POST/PUT/DELETE /api/users/*` - 사용자 (JWT 필요, 일부 ADMIN 전용)
- `GET/POST/PUT/DELETE /api/stocks/*` - 주식 (목록/상세는 비인증)
- `GET/POST/PUT/DELETE /api/news/*` - 뉴스 (목록/상세는 비인증)
- `GET/POST /api/portfolios/*` - 포트폴리오/매수/매도 (JWT 필요)
- `GET /api/leaderboard` - 리더보드 (비인증), `/api/leaderboard/admin` (ADMIN)
- `GET/POST /api/admin/*` - 관리자 대시보드 (ADMIN)

## 데이터베이스

- SQLite 파일: `stockgame.db` (프로젝트 루트에 생성)
- 앱 기동 시 시드 데이터(주식 6종목, 뉴스 4건) 자동 삽입 (비어 있을 때만)

## 기존 프론트엔드와 연동

`stockGame-fe` 프론트엔드는 백엔드 URL을 `http://localhost:3000/api`로 맞추면 동일하게 동작합니다.
