# STOCK IT 배포 가이드

## 🚀 개요

STOCK IT 게임의 프론트엔드와 백엔드를 다양한 환경에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker 및 Docker Compose (권장 배포 방식)
- 또는 Java 17+, Maven 3.8+ (백엔드 단독 실행 시)
- Git
- 서버 접근 권한 (배포 시)

## 🔧 환경 설정

### 1. Docker로 배포할 때 (권장)

**프로젝트 루트**에만 환경 변수 파일을 둡니다. `fe`/`be` 폴더 안에는 `.env`나 `env.sample`을 두지 않습니다.

- 루트 `env.sample`을 복사해 `.env`로 저장한 뒤, 배포용 값으로 수정하세요.
- 변수 목록: `MYSQL_*`, `JWT_SECRET`, `KAKAO_*`, `GOOGLE_*`, `FRONTEND_URL` 등. (자세한 예시는 프로젝트 루트의 `env.sample` 참고.)

```bash
# 프로젝트 루트에서
cp env.sample .env
# .env 편집 후
docker compose up -d --build
```

프론트엔드는 상대 경로 `/api`로 빌드되므로 별도 .env 없이 동작합니다.

### 2. Docker 없이 배포할 때 (정적 프론트·별도 백엔드 등)

백엔드는 환경 변수로 `PORT`, `JWT_SECRET`, `DB_*`, OAuth, `FRONTEND_URL` 등을 설정합니다. (Spring Boot `application.yml` 또는 시스템 환경 변수.)

프론트엔드는 빌드 시 `VITE_API_URL` 등이 필요하면 해당 배포 방식 문서를 참고하세요.

## ✅ 배포 전 체크리스트

### 환경변수 설정 확인
- [ ] `FRONTEND_URL`이 실제 프론트엔드 도메인으로 설정됨
- [ ] `BACKEND_URL`이 실제 백엔드 도메인으로 설정됨
- [ ] OAuth 리다이렉트 URI가 실제 도메인으로 설정됨
- [ ] JWT 시크릿이 프로덕션용으로 변경됨
- [ ] 데이터베이스 연결 정보가 프로덕션 환경에 맞게 설정됨

### 코드 수정 확인
- [ ] 하드코딩된 localhost URL이 모두 제거됨
- [ ] 환경변수를 통한 동적 URL 관리가 구현됨
- [ ] CORS 설정이 프론트엔드 도메인을 포함하도록 설정됨

## 🖥️ 백엔드 배포

이 프로젝트의 백엔드는 **Spring Boot(Java)** 입니다. Node.js/PM2 방식은 사용하지 않습니다.

### 방법 1: Docker Compose로 한 번에 배포 (권장)

프론트엔드·백엔드·MySQL을 한 번에 띄웁니다.

```bash
# 프로젝트 루트에서
cp env.sample .env
# .env 편집 (DB, JWT, OAuth 등)
docker compose up -d --build
```

서버 앞단에 Nginx 등 리버스 프록시를 두고 HTTPS·도메인을 설정하면 됩니다.

### 방법 2: 백엔드만 JAR로 실행

```bash
cd stockGame-be
mvn package -DskipTests
java -jar target/stockgame-be-1.0.0.jar
```

환경 변수로 `PORT`, `JWT_SECRET`, `DB_*`, `FRONTEND_URL` 등을 설정합니다.

### 방법 3: Nginx 리버스 프록시

#### 1. Nginx 설치
```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. Nginx 설정
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

#### 3. Nginx 재시작
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🌐 프론트엔드 배포

### 방법 1: Vercel 배포 (권장)

#### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2. 프로젝트 빌드
```bash
cd frontend
npm run build
```

#### 3. Vercel 배포
```bash
vercel
# 프롬프트에 따라 설정
```

#### 4. 환경변수 설정
Vercel 대시보드에서 환경변수를 설정하세요.

### 방법 2: Netlify 배포

#### 1. 프로젝트 빌드
```bash
cd frontend
npm run build
```

#### 2. Netlify에 배포
- Netlify 대시보드에서 `dist` 폴더를 드래그 앤 드롭
- 또는 Git 저장소 연결

#### 3. 환경변수 설정
Netlify 대시보드에서 환경변수를 설정하세요.

### 방법 3: GitHub Pages 배포

#### 1. GitHub Actions 워크플로우 설정
`.github/workflows/deploy-frontend.yml` 파일을 생성하고 다음 내용을 추가:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: './frontend/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
```

#### 2. GitHub 저장소 설정
- Settings > Pages에서 Source를 "GitHub Actions"로 설정

### 방법 4: 정적 호스팅 서비스

#### 1. 프로젝트 빌드
```bash
cd frontend
npm run build
```

#### 2. dist 폴더 업로드
- AWS S3, Google Cloud Storage 등에 업로드
- CDN 설정 (CloudFront, Cloud CDN 등)

## 🔒 SSL 인증서 설정

### Let's Encrypt 사용 (무료)

#### 1. Certbot 설치
```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com
```

#### 3. 자동 갱신 설정
```bash
sudo crontab -e
# 다음 줄 추가
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 모니터링 및 로깅

### Docker Compose 로그
```bash
# 백엔드 로그
docker compose logs -f backend

# 프론트엔드 로그
docker compose logs -f frontend

# MySQL 로그
docker compose logs -f mysql
```

### Nginx 로그
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

## 🔄 자동 배포 설정

### GitHub Actions를 사용한 자동 배포

#### 1. 백엔드 자동 배포 (Docker Compose)
`.github/workflows/deploy-backend.yml` 파일을 생성:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['stockGame-be/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/stockGame
          git pull origin main
          docker compose up -d --build backend
```

#### 2. 시크릿 설정
GitHub 저장소의 Settings > Secrets에서 다음을 설정:
- `HOST`: 서버 IP 주소
- `USERNAME`: SSH 사용자명
- `SSH_KEY`: SSH 개인키

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tulpn | grep :3000

# 프로세스 종료
sudo kill -9 <PID>
```

#### 2. 권한 문제
```bash
# 파일 권한 수정
sudo chown -R $USER:$USER /path/to/project
sudo chmod -R 755 /path/to/project
```

#### 3. 메모리 부족
Docker Compose 사용 시 `docker-compose.yml`에서 해당 서비스에 `mem_limit` 등을 설정할 수 있습니다.

## 📞 지원

배포 관련 문제가 발생하면 다음을 확인하세요:

1. 로그 파일 확인
2. 환경변수 설정 확인
3. 포트 및 방화벽 설정 확인
4. GitHub Issues에 문제 등록

---

**STOCK IT** - 성공적인 배포를 위한 가이드 🚀
