import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('kakao/login')
  kakaoLogin() {
    const kakaoAuthUrl = this.authService.getKakaoAuthUrl();
    return { url: kakaoAuthUrl };
  }

  @Public()
  @Get('google/login')
  googleLogin() {
    const googleAuthUrl = this.authService.getGoogleAuthUrl();
    return { url: googleAuthUrl };
  }

  @Public()
  @Get('kakao/callback')
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '인증 코드가 필요합니다.',
        });
      }

      const result = await this.authService.kakaoLogin(code);

      // 프론트엔드로 리다이렉트
      const redirectUrl = `https://kimjhyun0627.github.io/auth/kakao/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Kakao 로그인 에러:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '카카오 로그인에 실패했습니다.';
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Public()
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '인증 코드가 필요합니다.',
        });
      }

      const result = await this.authService.googleLogin(code);

      // 프론트엔드로 리다이렉트
      const redirectUrl = `https://kimjhyun0627.github.io/auth/google/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      const errorMessage =
        error instanceof Error ? error.message : '구글 로그인에 실패했습니다.';
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authService.refreshToken(body.refreshToken);
  }
}
