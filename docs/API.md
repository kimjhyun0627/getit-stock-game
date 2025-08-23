# STOCK IT API 문서

## 📋 개요

STOCK IT 게임의 백엔드 API 문서입니다. 모든 API는 `http://localhost:3000/api`를 기본 URL로 사용합니다.

## 🔐 인증

### JWT 토큰
- 모든 보호된 API는 `Authorization: Bearer {token}` 헤더가 필요합니다.
- 토큰은 로그인 시 발급되며, 24시간 후 만료됩니다.

### OAuth 로그인
- 카카오와 구글 OAuth를 지원합니다.
- 로그인 성공 시 JWT 토큰을 반환합니다.

## 📊 API 엔드포인트

### 🔐 인증 API

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "nickname": "사용자",
    "role": "USER"
  }
}
```

#### 토큰 갱신
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### 카카오 OAuth
```http
GET /api/auth/kakao
```

#### 구글 OAuth
```http
GET /api/auth/google
```

### 👤 사용자 API

#### 현재 사용자 정보 조회
```http
GET /api/users/me
Authorization: Bearer {token}
```

#### 사용자 정보 수정
```http
PUT /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nickname": "새로운닉네임",
  "email": "newemail@example.com"
}
```

#### 관리자 권한 부여
```http
POST /api/users/make-admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 📈 주식 API

#### 주식 목록 조회
```http
GET /api/stocks
```

**응답:**
```json
[
  {
    "id": "stock_id",
    "name": "삼성전자",
    "symbol": "005930",
    "currentPrice": 75000,
    "volume": 1000000,
    "change": 1500,
    "changePercent": 2.04
  }
]
```

#### 주식 생성 (관리자)
```http
POST /api/stocks
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운주식",
  "symbol": "NEW001",
  "currentPrice": 50000,
  "volume": 1000000
}
```

#### 주식 정보 수정 (관리자)
```http
PUT /api/stocks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPrice": 55000,
  "volume": 1200000
}
```

#### 주식 삭제 (관리자)
```http
DELETE /api/stocks/:id
Authorization: Bearer {token}
```

### 💰 포트폴리오 API

#### 포트폴리오 조회
```http
GET /api/portfolios
Authorization: Bearer {token}
```

#### 주식 매수
```http
POST /api/portfolios/buy
Authorization: Bearer {token}
Content-Type: application/json

{
  "stockId": "stock_id",
  "quantity": 10
}
```

#### 주식 매도
```http
POST /api/portfolios/sell
Authorization: Bearer {token}
Content-Type: application/json

{
  "stockId": "stock_id",
  "quantity": 5
}
```

#### 거래 내역 조회
```http
GET /api/portfolios/transactions
Authorization: Bearer {token}
```

### 📰 뉴스 API

#### 뉴스 목록 조회
```http
GET /api/news
```

#### 뉴스 생성 (관리자)
```http
POST /api/news
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "뉴스 제목",
  "summary": "뉴스 요약",
  "content": "뉴스 전체 내용",
  "category": "economy",
  "stockId": "stock_id"
}
```

#### 뉴스 수정 (관리자)
```http
PUT /api/news/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

#### 뉴스 삭제 (관리자)
```http
DELETE /api/news/:id
Authorization: Bearer {token}
```

### 🏆 리더보드 API

#### 공개 리더보드 조회
```http
GET /api/leaderboard
```

#### 관리자용 리더보드 조회
```http
GET /api/leaderboard/admin
Authorization: Bearer {token}
```

#### 리더보드 통계
```http
GET /api/leaderboard/stats
Authorization: Bearer {token}
```

#### 사용자 가시성 토글
```http
PUT /api/leaderboard/admin/:userId/visibility
Authorization: Bearer {token}
Content-Type: application/json

{
  "isVisible": false
}
```

#### 리더보드 강제 새로고침
```http
POST /api/leaderboard/admin/refresh
Authorization: Bearer {token}
```

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공적으로 처리되었습니다."
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  }
}
```

## 🔒 권한 레벨

### PUBLIC
- 인증이 필요하지 않은 API
- 주식 조회, 뉴스 조회, 공개 리더보드 등

### USER
- 로그인한 사용자만 접근 가능
- 포트폴리오 조회, 주식 매수/매도 등

### ADMIN
- 관리자만 접근 가능
- 주식 생성/수정/삭제, 뉴스 관리, 사용자 권한 관리 등

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `UNAUTHORIZED` | 인증이 필요합니다 |
| `FORBIDDEN` | 권한이 부족합니다 |
| `NOT_FOUND` | 리소스를 찾을 수 없습니다 |
| `VALIDATION_ERROR` | 입력 데이터가 유효하지 않습니다 |
| `INTERNAL_ERROR` | 서버 내부 오류가 발생했습니다 |

## 🚀 사용 예시

### JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:3000/api/stocks', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### cURL
```bash
curl -X GET "http://localhost:3000/api/stocks" \
  -H "Authorization: Bearer your_token_here"
```

## 📞 지원

API 관련 문의사항이 있으시면 이슈를 생성해 주세요.
