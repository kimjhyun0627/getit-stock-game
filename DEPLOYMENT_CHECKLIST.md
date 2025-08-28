# 🚀 배포 전 체크리스트

## ✅ 환경변수 설정 확인

### 백엔드 환경변수
- [ ] `FRONTEND_URL`이 실제 프론트엔드 도메인으로 설정됨 (예: `https://your-domain.com`)
- [ ] `BACKEND_URL`이 실제 백엔드 도메인으로 설정됨 (예: `https://your-domain.com`)
- [ ] `KAKAO_REDIRECT_URI`가 실제 도메인으로 설정됨 (예: `https://your-domain.com/api/auth/kakao/callback`)
- [ ] `GOOGLE_REDIRECT_URI`가 실제 도메인으로 설정됨 (예: `https://your-domain.com/api/auth/google/callback`)
- [ ] `JWT_SECRET`이 프로덕션용으로 변경됨
- [ ] 데이터베이스 연결 정보가 프로덕션 환경에 맞게 설정됨

### 프론트엔드 환경변수
- [ ] `VITE_API_URL`이 실제 백엔드 API URL로 설정됨 (예: `https://your-domain.com/api`)

## ✅ 코드 수정 확인

### 하드코딩된 URL 제거
- [ ] `localhost:3000` → 환경변수로 대체됨
- [ ] `localhost:5173` → 환경변수로 대체됨
- [ ] 모든 API 호출이 환경변수를 통해 동적으로 관리됨

### 설정 파일 수정
- [ ] `src/config/configuration.ts`에 URL 설정 추가됨
- [ ] `src/main.ts`에서 CORS 설정이 환경변수 기반으로 동작함
- [ ] `src/auth/controllers/auth.controller.ts`에서 리다이렉트 URL이 환경변수 기반으로 동작함

## ✅ 보안 설정 확인

- [ ] 프로덕션 환경에서 `NODE_ENV=production` 설정
- [ ] 강력한 JWT 시크릿 키 사용
- [ ] 데이터베이스 비밀번호가 안전하게 설정됨
- [ ] OAuth 클라이언트 시크릿이 안전하게 설정됨

## ✅ 배포 환경 확인

### 서버 설정
- [ ] 도메인 SSL 인증서 설정 완료
- [ ] 방화벽 설정 (포트 80, 443, 3000)
- [ ] 데이터베이스 서버 접근 가능

### 모니터링
- [ ] 로그 수집 시스템 설정
- [ ] 에러 모니터링 시스템 설정
- [ ] 성능 모니터링 시스템 설정

## 🚨 주의사항

1. **환경변수 파일 (.env)은 절대 Git에 커밋하지 마세요**
2. **프로덕션 환경에서는 반드시 HTTPS를 사용하세요**
3. **데이터베이스 백업을 정기적으로 수행하세요**
4. **OAuth 앱 설정에서 리다이렉트 URI를 실제 도메인으로 변경하세요**

## 📋 배포 후 확인사항

- [ ] 프론트엔드에서 백엔드 API 호출 성공
- [ ] OAuth 로그인 (카카오, 구글) 정상 작동
- [ ] 모든 기능이 정상적으로 동작
- [ ] 에러 로그 확인
- [ ] 성능 테스트 수행

## 🔧 문제 해결

### 일반적인 문제들
1. **CORS 에러**: `FRONTEND_URL` 환경변수 확인
2. **OAuth 리다이렉트 에러**: 리다이렉트 URI 설정 확인
3. **API 연결 실패**: `VITE_API_URL` 환경변수 확인
4. **데이터베이스 연결 실패**: 데이터베이스 서버 접근 권한 확인

### 로그 확인 방법
```bash
# 백엔드 로그 확인
pm2 logs stock-it-backend

# 프론트엔드 로그 확인 (브라우저 개발자 도구)
# Console 탭에서 에러 메시지 확인
```
