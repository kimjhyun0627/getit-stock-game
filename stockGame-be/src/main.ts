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
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 글로벌 접두사 설정
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // 시드 데이터 삽입
  try {
    const seedService = app.get(SeedService);
    await seedService.seedAll();
  } catch (error) {
    console.error('시드 데이터 삽입 중 오류 발생:', error.message);
  }

  console.log(`🚀 주식게임 백엔드 서버가 포트 ${port}에서 실행 중입니다!`);
}
bootstrap();
