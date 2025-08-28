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
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('kakao/login')
  kakaoLogin() {
    console.log('🚀 카카오 로그인 요청 시작');
    const kakaoAuthUrl = this.authService.getKakaoAuthUrl();
    console.log('✅ 카카오 OAuth URL 생성 완료:', kakaoAuthUrl);
    return { url: kakaoAuthUrl };
  }

  @Public()
  @Get('google/login')
  googleLogin() {
    console.log('🚀 구글 로그인 요청 시작');
    const googleAuthUrl = this.authService.getGoogleAuthUrl();
    console.log('✅ 구글 OAuth URL 생성 완료:', googleAuthUrl);
    return { url: googleAuthUrl };
  }

  @Public()
  @Get('kakao/callback')
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    console.log('🔄 카카오 OAuth 콜백 시작');
    console.log('📋 요청 쿼리 파라미터:', req.query);

    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        console.error('❌ 카카오 인증 코드가 없습니다:', { code });
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '인증 코드가 필요합니다.',
        });
      }

      console.log(
        '🔑 카카오 인증 코드 확인 완료:',
        code.substring(0, 10) + '...',
      );
      console.log('🔄 카카오 사용자 정보 요청 시작...');

      const result = await this.authService.kakaoLogin(code);

      console.log('✅ 카카오 로그인 성공:', {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
      });

      // 프론트엔드로 리다이렉트
      const frontendUrl =
        this.configService.get<string>('urls.frontend') ||
        process.env.FRONTEND_URL;
      console.log('🔍 Kakao 콜백 - frontendUrl:', frontendUrl);
      console.log(
        '🔍 Kakao 콜백 - 환경변수 FRONTEND_URL:',
        process.env.FRONTEND_URL,
      );

      if (!frontendUrl) {
        console.error(
          '❌ frontendUrl이 설정되지 않았습니다. 기본값을 사용합니다.',
        );
        const defaultFrontendUrl = 'http://localhost:5173';
        const redirectUrl = `${defaultFrontendUrl}/auth/kakao/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
        return res.redirect(redirectUrl);
      }

      const redirectUrl = `${frontendUrl}/auth/kakao/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

      console.log(
        '🔀 카카오 프론트엔드 리다이렉트:',
        redirectUrl.substring(0, 100) + '...',
      );
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
    console.log('🔄 구글 OAuth 콜백 시작');
    console.log('📋 요청 쿼리 파라미터:', req.query);

    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        console.error('❌ 구글 인증 코드가 없습니다:', { code });
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: '인증 코드가 필요합니다.',
        });
      }

      console.log(
        '🔑 구글 인증 코드 확인 완료:',
        code.substring(0, 10) + '...',
      );
      console.log('🔄 구글 사용자 정보 요청 시작...');

      const result = await this.authService.googleLogin(code);

      console.log('✅ 구글 로그인 성공:', {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
      });

      // 프론트엔드로 리다이렉트
      const frontendUrl =
        this.configService.get<string>('urls.frontend') ||
        process.env.FRONTEND_URL;
      console.log('🔍 Google 콜백 - frontendUrl:', frontendUrl);
      console.log(
        '🔍 Google 콜백 - 환경변수 FRONTEND_URL:',
        process.env.FRONTEND_URL,
      );

      if (!frontendUrl) {
        console.error(
          '❌ frontendUrl이 설정되지 않았습니다. 기본값을 사용합니다.',
        );
        const defaultFrontendUrl = 'http://localhost:5173';
        const redirectUrl = `${defaultFrontendUrl}/auth/google/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
        return res.redirect(redirectUrl);
      }

      const redirectUrl = `${frontendUrl}/auth/google/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

      console.log(
        '🔀 구글 프론트엔드 리다이렉트:',
        redirectUrl.substring(0, 100) + '...',
      );
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
    console.log('🔄 토큰 갱신 요청 시작');
    console.log('📋 RefreshToken 존재 여부:', !!body.refreshToken);

    try {
      const result = await this.authService.refreshToken(body.refreshToken);
      console.log('✅ 토큰 갱신 성공:', {
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
      });
      return result;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      throw error;
    }
  }
}
