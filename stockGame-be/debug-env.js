// Docker 환경에서 환경변수 확인용 스크립트
console.log('=== 환경변수 디버깅 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '미설정');
console.log(
  'KAKAO_CLIENT_ID:',
  process.env.KAKAO_CLIENT_ID ? '설정됨' : '미설정',
);
console.log('KAKAO_REDIRECT_URI:', process.env.KAKAO_REDIRECT_URI);
console.log(
  'GOOGLE_CLIENT_ID:',
  process.env.GOOGLE_CLIENT_ID ? '설정됨' : '미설정',
);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('===================');

// 프로세스 종료
process.exit(0);
