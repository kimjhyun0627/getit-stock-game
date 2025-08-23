import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { JwtService } from './jwt.service';
import { KakaoOAuthService, KakaoUserInfo } from './kakao-oauth.service';
import { GoogleOAuthService, GoogleUserInfo } from './google-oauth.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    nickname: string;
    email?: string;
    role: string;
    balance: number;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly kakaoOAuthService: KakaoOAuthService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  getKakaoAuthUrl(): string {
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    return url;
  }

  getGoogleAuthUrl(): string {
    return this.googleOAuthService.getGoogleAuthUrl();
  }

  async kakaoLogin(authorizationCode: string): Promise<AuthTokens> {
    // 1. 카카오 액세스 토큰 획득
    const kakaoAccessToken =
      await this.kakaoOAuthService.getAccessToken(authorizationCode);

    // 2. 카카오 사용자 정보 획득
    const kakaoUserInfo =
      await this.kakaoOAuthService.getUserInfo(kakaoAccessToken);

    // 3. 사용자 찾기 또는 생성
    let user = await this.userRepository.findOne({
      where: { kakaoId: kakaoUserInfo.id.toString() },
    });

    if (!user) {
      // 새 사용자 생성
      user = await this.createUserFromKakao(kakaoUserInfo);
    } else {
      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    // 4. 기존 세션 정리 (보안을 위해)
    await this.cleanupOldSessions(user.id);

    // 5. JWT 토큰 생성
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    // 6. 리프레시 토큰 저장
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    };
  }

  async googleLogin(authorizationCode: string): Promise<AuthTokens> {
    // 1. 구글 액세스 토큰 획득
    const googleAccessToken =
      await this.googleOAuthService.getAccessToken(authorizationCode);

    // 2. 구글 사용자 정보 획득
    const googleUserInfo =
      await this.googleOAuthService.getUserInfo(googleAccessToken);

    // 3. 사용자 찾기 또는 생성
    let user = await this.userRepository.findOne({
      where: { googleId: googleUserInfo.id },
    });

    if (!user) {
      // 새 사용자 생성
      user = await this.createUserFromGoogle(googleUserInfo);
    } else {
      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    // 4. 기존 세션 정리 (보안을 위해)
    await this.cleanupOldSessions(user.id);

    // 5. JWT 토큰 생성
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    // 6. 리프레시 토큰 저장
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    };
  }

  private async createUserFromKakao(
    kakaoUserInfo: KakaoUserInfo,
  ): Promise<User> {
    const user = this.userRepository.create({
      email: kakaoUserInfo.kakao_account.email,
      name: kakaoUserInfo.kakao_account.profile.nickname,
      nickname: kakaoUserInfo.kakao_account.profile.nickname,
      profileImage: kakaoUserInfo.kakao_account.profile.profile_image_url,
      kakaoId: kakaoUserInfo.id.toString(),
      role: UserRole.USER,
      balance: 10000000, // 1000만원
      lastLoginAt: new Date(),
    });

    return await this.userRepository.save(user);
  }

  private async createUserFromGoogle(
    googleUserInfo: GoogleUserInfo,
  ): Promise<User> {
    const user = this.userRepository.create({
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      nickname: googleUserInfo.name,
      profileImage: googleUserInfo.picture,
      googleId: googleUserInfo.id,
      role: UserRole.USER,
      balance: 10000000, // 1000만원
      lastLoginAt: new Date(),
    });

    return await this.userRepository.save(user);
  }

  private async cleanupOldSessions(userId: string): Promise<void> {
    await this.userSessionRepository.delete({ userId });
  }

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    const session = this.userSessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });

    await this.userSessionRepository.save(session);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // 1. 리프레시 토큰 검증
    const session = await this.userSessionRepository.findOne({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new HttpException(
        '유효하지 않은 리프레시 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 2. 사용자 정보 조회
    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      throw new HttpException(
        '사용자를 찾을 수 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3. 새로운 토큰 생성
    const newAccessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    // 4. 기존 세션 삭제 및 새 세션 저장
    await this.userSessionRepository.delete({ id: session.id });
    await this.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userSessionRepository.delete({ userId });
  }

  async validateUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
