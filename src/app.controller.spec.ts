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
    it('returns the API banner payload', () => {
      expect(appController.getHello()).toEqual({
        name: 'Seeman Auto API',
        status: 'running',
        version: '1.0.0',
      });
    });
  });

  describe('health', () => {
    it('reports an ok status with an ISO timestamp', () => {
      const health = appController.getHealth();
      expect(health.status).toBe('ok');
      expect(() => new Date(health.timestamp).toISOString()).not.toThrow();
    });
  });
});
