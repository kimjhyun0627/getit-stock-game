import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SeedService } from './seed/seed.service';
import { Express } from 'express';

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
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 글로벌 접두사 설정
  app.setGlobalPrefix('api');

  // Express 인스턴스 가져오기
  const expressApp = app.getHttpAdapter().getInstance() as Express;

  // 루트 경로에 헬스체크 추가 (글로벌 접두사 적용 전)
  expressApp.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Stock Game Backend is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 헬스체크 엔드포인트 (글로벌 접두사 적용 전)
  expressApp.get('/health', (req, res) => {
    try {
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      };

      res.status(200).json(healthData);
    } catch (error) {
      console.error('헬스체크 에러:', error);
      res.status(500).json({
        status: 'error',
        message: '헬스체크 실패',
        timestamp: new Date().toISOString(),
      });
    }
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
    console.error('시드 데이터 삽입 중 오류 발생:', error.message);
  }

  console.log(`🚀 주식게임 백엔드 서버가 포트 ${port}에서 실행 중입니다!`);
  console.log(`💚 헬스체크: http://localhost:${port}/health`);
  console.log(`🌐 API 엔드포인트: http://localhost:${port}/api`);
}
bootstrap();
