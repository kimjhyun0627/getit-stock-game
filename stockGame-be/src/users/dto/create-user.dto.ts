import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  nickname?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  balance?: number;
  kakaoId?: string;
  profileImage?: string;
}
