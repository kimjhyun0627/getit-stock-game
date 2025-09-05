FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치를 위한 package.json 복사
COPY package*.json ./
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY dist ./dist
COPY debug-env.js ./debug-env.js

# SQLite 데이터베이스를 위한 디렉토리 생성
RUN mkdir -p /app/data

# 포트 노출
EXPOSE 3000

# 환경변수 기본값 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_SECRET=your-super-secret-jwt-key-here

# 애플리케이션 실행
CMD ["node", "dist/main"]
