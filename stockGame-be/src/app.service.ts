import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'GETIT 주식게임 백엔드 서버에 오신 것을 환영합니다! 🚀';
  }
}
