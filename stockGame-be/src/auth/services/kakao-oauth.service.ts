/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    email_needs_agreement: boolean;
    email: string;
    age_range_needs_agreement: boolean;
    age_range?: string;
    birthday_needs_agreement: boolean;
    birthday?: string;
    gender_needs_agreement: boolean;
    gender?: string;
  };
}

@Injectable()
export class KakaoOAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getAccessToken(authorizationCode: string): Promise<string> {
    try {
      const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'KAKAO_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new HttpException(
          '카카오 OAuth 설정이 올바르지 않습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('code', authorizationCode);
      params.append('redirect_uri', redirectUri);

      const response = await firstValueFrom(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (this.httpService as any).post(
          'https://kauth.kakao.com/oauth/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return (response as { data: { access_token: string } }).data.access_token;
    } catch (error: any) {
      console.error('카카오 토큰 요청 오류:', {
        message: (error as any).message,
        status: (error as any).response?.status,
        error: (error as any).response?.data?.error,
        description: (error as any).response?.data?.error_description,
        code: (error as any).response?.data?.error_code,
      });
      throw new HttpException(
        '카카오 액세스 토큰을 가져오는데 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    try {
      const response = await firstValueFrom(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        (this.httpService as any).get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return (response as { data: KakaoUserInfo }).data;
    } catch {
      throw new HttpException(
        '카카오 사용자 정보를 가져오는데 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getKakaoLoginUrl(): string {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }
}
