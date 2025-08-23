# STOCK IT 기여 가이드

## 🎯 기여하기

STOCK IT 프로젝트에 기여하고 싶어주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📋 기여 방법

### 1. 이슈 리포트
- 버그 발견 시 이슈를 생성해 주세요
- 새로운 기능 제안도 환영합니다
- 이슈 생성 시 상세한 설명을 포함해 주세요

### 2. 코드 기여
- Fork 후 Pull Request를 보내주세요
- 작은 수정부터 큰 기능까지 모두 환영합니다
- 코드 품질과 테스트를 고려해 주세요

### 3. 문서 개선
- README, API 문서, 코드 주석 개선
- 번역 및 다국어 지원
- 사용자 가이드 작성

### 4. 테스트 및 버그 리포트
- 새로운 기능 테스트
- 다양한 환경에서의 테스트
- 성능 테스트 및 최적화 제안

## 🚀 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Git

### 1. 저장소 Fork
```bash
# GitHub에서 저장소 Fork
# Fork된 저장소 클론
git clone https://github.com/your-username/stock-it-game.git
cd stock-it-game
```

### 2. 원격 저장소 설정
```bash
# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/original-username/stock-it-game.git

# 원격 저장소 확인
git remote -v
```

### 3. 의존성 설치
```bash
# 루트 의존성 설치
npm install

# 모든 워크스페이스 의존성 설치
npm run install:all
```

### 4. 개발 서버 실행
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 개별 실행
npm run dev:frontend
npm run dev:backend
```

## 📝 코딩 스타일

### TypeScript
- 엄격한 타입 체크 사용
- 인터페이스와 타입 정의 명확하게
- `any` 타입 사용 지양

### React (프론트엔드)
- 함수형 컴포넌트 사용
- Hooks 적절히 활용
- Props 인터페이스 명시

### NestJS (백엔드)
- 데코레이터 활용
- DTO와 엔티티 분리
- 서비스 레이어 패턴 준수

### 일반적인 규칙
- 의미있는 변수명과 함수명
- 적절한 주석 작성
- 에러 처리 철저히
- 테스트 코드 작성

## 🔧 개발 워크플로우

### 1. 브랜치 생성
```bash
# main 브랜치에서 최신 상태 유지
git checkout main
git pull upstream main

# 새로운 기능 브랜치 생성
git checkout -b feature/amazing-feature
```

### 2. 개발 및 테스트
```bash
# 코드 작성
# 테스트 실행
npm run test

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format
```

### 3. 커밋
```bash
# 변경사항 스테이징
git add .

# 의미있는 커밋 메시지로 커밋
git commit -m "feat: add amazing feature

- 새로운 기능 추가
- 기존 기능 개선
- 버그 수정"
```

### 4. Push 및 Pull Request
```bash
# 브랜치 푸시
git push origin feature/amazing-feature

# GitHub에서 Pull Request 생성
```

## 📋 커밋 메시지 규칙

### 커밋 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

### 예시
```
feat: add user authentication system
fix: resolve leaderboard ranking issue
docs: update API documentation
style: format code with prettier
refactor: simplify portfolio calculation
test: add unit tests for stock service
chore: update dependencies
```

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend

# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 프론트엔드 테스트
```bash
cd frontend

# 단위 테스트
npm run test

# 테스트 커버리지
npm run test:coverage
```

### 테스트 작성 가이드
- 각 기능에 대한 단위 테스트 작성
- 중요한 비즈니스 로직에 대한 통합 테스트
- 사용자 시나리오에 대한 E2E 테스트

## 🔍 코드 리뷰

### Pull Request 작성 시
- 명확한 제목과 설명
- 변경사항 요약
- 테스트 방법 안내
- 관련 이슈 링크

### 리뷰어로서
- 코드 품질 검토
- 보안 취약점 확인
- 성능 영향 분석
- 건설적인 피드백 제공

## 🚨 보안

### 보안 가이드라인
- 민감한 정보는 절대 커밋하지 않기
- 환경변수 사용
- 입력값 검증 철저히
- SQL 인젝션 방지

### 보안 이슈 발견 시
- 보안 이슈는 즉시 비공개로 리포트
- 상세한 재현 방법 제공
- 가능한 해결책 제안

## 📚 문서화

### 코드 주석
- 복잡한 로직에 대한 설명
- API 엔드포인트 설명
- 비즈니스 규칙 설명

### README 업데이트
- 새로운 기능 추가 시 문서 업데이트
- 설치 및 실행 방법 최신화
- 예시 코드 제공

### API 문서
- 새로운 엔드포인트 추가 시 문서화
- 요청/응답 예시 제공
- 에러 코드 설명

## 🌟 기여자 인정

### 기여자 목록
- 모든 기여자는 프로젝트 README에 기여자로 등록
- 주요 기여자는 메인테이너로 승격 가능

### 기여 인정
- 코드 기여
- 문서 작성
- 버그 리포트
- 기능 제안
- 테스트 및 품질 개선

## 📞 커뮤니케이션

### 의사소통 채널
- GitHub Issues: 버그 리포트 및 기능 제안
- GitHub Discussions: 일반적인 질문 및 토론
- Pull Request: 코드 리뷰 및 논의

### 커뮤니티 가이드라인
- 존중과 배려
- 건설적인 피드백
- 학습과 성장 지향
- 다양한 관점 존중

## 🎉 첫 기여하기

### 초보자를 위한 가이드
1. **Good First Issue** 라벨이 붙은 이슈 선택
2. 간단한 문서 수정부터 시작
3. 코드 리뷰 요청 시 상세한 설명
4. 질문이 있으면 언제든 이슈 생성

### 추천 기여 영역
- 문서 개선
- 테스트 코드 작성
- UI/UX 개선
- 성능 최적화
- 접근성 개선

## 📋 체크리스트

### Pull Request 제출 전
- [ ] 코드가 프로젝트 스타일 가이드 준수
- [ ] 모든 테스트 통과
- [ ] 린트 검사 통과
- [ ] 문서 업데이트 (필요시)
- [ ] 커밋 메시지 규칙 준수
- [ ] 변경사항 설명 명확

### 코드 리뷰 시
- [ ] 기능 요구사항 충족
- [ ] 코드 품질 및 가독성
- [ ] 보안 고려사항
- [ ] 성능 영향
- [ ] 테스트 커버리지

## 🚀 다음 단계

기여를 시작하려면:

1. **저장소 Fork**
2. **개발 환경 설정**
3. **첫 번째 이슈 선택**
4. **브랜치 생성 및 개발**
5. **Pull Request 제출**

## 📞 도움 요청

기여 과정에서 도움이 필요하면:

- GitHub Issues에 질문 등록
- GitHub Discussions에서 토론 참여
- 프로젝트 메인테이너에게 연락

---

**STOCK IT** - 함께 만들어가는 모의 투자 게임 🚀

> 모든 기여자분들께 감사드립니다!
