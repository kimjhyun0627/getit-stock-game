import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  memory: NodeJS.MemoryUsage;
  pid: number;
  version: string;
  platform: string;
  arch: string;
}

interface RootResponse {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
}

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(async () => {
    // 모든 테스트가 끝난 후 추가 정리
    if (app) {
      await app.close();
    }
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    const body = response.body as HealthResponse;

    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('pid');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('platform');
    expect(body).toHaveProperty('arch');

    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.environment).toBe('string');
    expect(typeof body.memory).toBe('object');
    expect(typeof body.pid).toBe('number');
    expect(typeof body.version).toBe('string');
    expect(typeof body.platform).toBe('string');
    expect(typeof body.arch).toBe('string');
  });

  it('/ (GET) - Root endpoint', async () => {
    const { body } = await request(app.getHttpServer()).get('/').expect(200);

    const typedBody = body as RootResponse;

    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');

    expect(body.status).toBe('ok');
    expect(body.message).toBe('Stock Game Backend is running');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.uptime).toBe('number');
  });

  it('/api (GET) - API prefix test', async () => {
    // API 접두사가 적용된 엔드포인트 테스트
    const response = await request(app.getHttpServer()).get('/api').expect(404); // API 접두사만으로는 404가 정상

    // 실제로는 /api/health 같은 경로로 접근해야 함
  });
});
