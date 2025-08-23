import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error('❌ ValidationPipe 에러:', errors);
        return new BadRequestException({
          message: '데이터 검증에 실패했습니다.',
          errors: errors.map((error) => ({
            field: error.property,
            value: error.value,
            constraints: error.constraints,
            children: error.children,
          })),
        });
      },
    }),
  );

  // 전역 JWT Guard 설정 (Public 데코레이터가 있는 엔드포인트 제외)
  const jwtAuthGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtAuthGuard);

  // CORS 설정
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://kimjhyun0627.github.io',
        'https://getit-stock-game.vercel.app',
        'https://getit-stock-game.railway.app',
      ];

  console.log('🌐 허용된 CORS 도메인:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Origin',
      'Accept',
      'Cache-Control',
      'X-File-Name',
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24시간
  });

  // Railway의 기본 CORS 헤더를 강제로 덮어쓰기
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    // 허용된 origin인 경우에만 CORS 헤더 설정
    if (corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // 다른 CORS 헤더들도 명시적으로 설정
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Origin, Accept, Cache-Control, X-File-Name',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  // 글로벌 접두사 설정 (헬스체크 경로 제외) - CORS 설정 직후에 설정
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health', '/hello'],
  });

  const port = process.env.PORT || 3000;
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 포트: ${port}`);

  await app.listen(port, '0.0.0.0'); // 모든 인터페이스에서 리스닝

  // 시드 데이터 삽입
  try {
    const seedService = app.get(SeedService);
    await seedService.seedAll();
  } catch (error) {
    console.error('시드 데이터 삽입 중 오류 발생:', error.message || error);
  }

  console.log(`🚀 주식게임 백엔드 서버가 포트 ${port}에서 실행 중입니다!`);
  console.log(`💚 헬스체크: https://getit-stock-game.railway.app/health`);
  console.log(`🌐 API 엔드포인트: https://getit-stock-game.railway.app/api`);
  console.log(`🏠 루트 경로: https://getit-stock-game.railway.app/`);
}
bootstrap();
