export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1521', 10),
    name: process.env.DB_NAME || 'stockgame',
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID || 'your-kakao-client-id',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || 'your-kakao-client-secret',
    redirectUri:
      process.env.KAKAO_REDIRECT_URI ||
      'http://localhost:3000/api/auth/kakao/callback',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:3000/api/auth/google/callback',
  },
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    backend: process.env.BACKEND_URL || 'http://localhost:3000',
  },
  // 모바일 호환성을 위한 추가 설정
  mobile: {
    enableTouchEvents: true,
    viewport:
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  },
});
