# STOCK IT 배포 가이드

## 🚀 개요

STOCK IT 게임의 프론트엔드와 백엔드를 다양한 환경에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Git
- 서버 접근 권한 (백엔드 배포 시)

## 🔧 환경 설정

### 1. 환경변수 파일 생성

#### 백엔드 (`.env`)
```bash
# Backend/.env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 프론트엔드 (`.env`)
```bash
# Frontend/.env
VITE_API_URL=https://your-backend-domain.com
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🖥️ 백엔드 배포

### 방법 1: PM2를 사용한 배포 (권장)

#### 1. 서버에 Node.js 설치
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. PM2 설치
```bash
npm install -g pm2
```

#### 3. 프로젝트 클론 및 설정
```bash
git clone https://github.com/username/stock-it-game.git
cd stock-it-game/backend
npm install
npm run build
```

#### 4. 환경변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 실제 값으로 설정
```

#### 5. PM2로 실행
```bash
pm2 start dist/main.js --name "stock-it-backend"
pm2 startup
pm2 save
```

#### 6. PM2 모니터링
```bash
pm2 monit
pm2 logs stock-it-backend
```

### 방법 2: Docker를 사용한 배포

#### 1. Dockerfile 생성
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

#### 2. Docker 이미지 빌드 및 실행
```bash
docker build -t stock-it-backend .
docker run -d -p 3000:3000 --name stock-it-backend stock-it-backend
```

### 방법 3: Nginx + Node.js

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

### PM2 모니터링
```bash
pm2 monit
pm2 logs
pm2 status
```

### Nginx 로그
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 애플리케이션 로그
```bash
# PM2 로그
pm2 logs stock-it-backend

# Docker 로그
docker logs stock-it-backend
```

## 🔄 자동 배포 설정

### GitHub Actions를 사용한 자동 배포

#### 1. 백엔드 자동 배포
`.github/workflows/deploy-backend.yml` 파일을 생성:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

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
          cd /path/to/stock-it-game
          git pull origin main
          cd backend
          npm install
          npm run build
          pm2 restart stock-it-backend
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
```bash
# PM2 메모리 제한 설정
pm2 start dist/main.js --name "stock-it-backend" --max-memory-restart 300M
```

#### 4. 로그 파일 크기 제한
```bash
# PM2 로그 로테이션
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 📞 지원

배포 관련 문제가 발생하면 다음을 확인하세요:

1. 로그 파일 확인
2. 환경변수 설정 확인
3. 포트 및 방화벽 설정 확인
4. GitHub Issues에 문제 등록

---

**STOCK IT** - 성공적인 배포를 위한 가이드 🚀
