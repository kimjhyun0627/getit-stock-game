import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      expect(appController.getHello()).toBe(
        'GETIT 주식게임 백엔드 서버에 오신 것을 환영합니다! 🚀',
      );
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const health = appController.getHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');

      expect(health.status).toBe('ok');
      expect(typeof health.timestamp).toBe('string');
      expect(typeof health.uptime).toBe('number');
    });

    it('should return valid timestamp', () => {
      const health = appController.getHealth();
      const timestamp = new Date(health.timestamp);

      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should return valid uptime', () => {
      const health = appController.getHealth();

      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
