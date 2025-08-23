import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getGoogleAuthUrl(): string {
    // 임시로 process.env 직접 사용
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new HttpException(
        'Google OAuth 설정이 누락되었습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getAccessToken(authorizationCode: string): Promise<string> {
    // 임시로 process.env 직접 사용
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new HttpException(
        'Google OAuth 설정이 누락되었습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      );

      if (response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new HttpException(
          'Google 액세스 토큰을 가져오는데 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Google 액세스 토큰 요청 실패:', error);
      throw new HttpException(
        'Google 액세스 토큰을 가져오는데 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error('Google 사용자 정보 요청 실패:', error);
      throw new HttpException(
        'Google 사용자 정보를 가져오는데 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
