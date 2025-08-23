// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getRoot(): string {
    return 'OK';
  }

  @Get('health')
  @Public()
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    memory: NodeJS.MemoryUsage;
    pid: number;
    version: string;
    platform: string;
    arch: string;
  } {
    return {
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
  }

  @Get('hello')
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
