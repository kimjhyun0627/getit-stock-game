import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly ADMIN_PASSWORD = 'admin123'; // 실제로는 환경변수나 설정에서 가져와야 함

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const password = request.headers['x-admin-password'] as string;

    if (!password || password !== this.ADMIN_PASSWORD) {
      throw new UnauthorizedException('관리자 인증이 필요합니다.');
    }

    return true;
  }
}
