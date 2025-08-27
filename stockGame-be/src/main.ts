import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('🚀 NestJS 주식게임 백엔드 서버를 시작합니다...');

  const app = await NestFactory.create(AppModule);
  logger.log('✅ NestJS 애플리케이션이 생성되었습니다.');

  // 글로벌 파이프 설정
  logger.log('🔧 글로벌 ValidationPipe를 설정합니다...');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        logger.error('❌ ValidationPipe 에러:', errors);
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
  logger.log('✅ ValidationPipe 설정이 완료되었습니다.');

  // 전역 JWT Guard 설정 (Public 데코레이터가 있는 엔드포인트 제외)
  logger.log('🔐 전역 JWT Guard를 설정합니다...');
  const jwtAuthGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtAuthGuard);
  logger.log('✅ JWT Guard 설정이 완료되었습니다.');

  // CORS 설정
  logger.log('🌐 CORS를 설정합니다...');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  logger.log('✅ CORS 설정이 완료되었습니다.');

  // 글로벌 접두사 설정
  logger.log('🔗 글로벌 API 접두사를 설정합니다...');
  app.setGlobalPrefix('api');
  logger.log('✅ API 접두사 설정이 완료되었습니다.');

  const port = process.env.PORT || 3000;
  logger.log(`🌍 서버를 포트 ${port}에서 시작합니다...`);
  await app.listen(port);

  // 시드 데이터 삽입
  logger.log('🌱 SQLite 데이터베이스에 시드 데이터를 삽입합니다...');
  try {
    const seedService = app.get(SeedService);
    await seedService.seedAll();
    logger.log('✅ 시드 데이터 삽입이 완료되었습니다.');
  } catch (error) {
    logger.error('❌ 시드 데이터 삽입 중 오류 발생:', error.message);
  }

  logger.log(`🎉 주식게임 백엔드 서버가 포트 ${port}에서 실행 중입니다!`);
  logger.log('📊 데이터 소스: SQLite 데이터베이스 (stockgame.db)');
  logger.log('🔗 API 엔드포인트: http://localhost:' + port + '/api');
  logger.log('📁 데이터베이스 파일: ./stockgame.db');
}
bootstrap();
