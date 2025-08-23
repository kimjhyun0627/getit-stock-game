import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class LeaderboardResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsNumber()
  totalAssets: number;

  @IsNumber()
  cashBalance: number;

  @IsNumber()
  stockValue: number;

  @IsNumber()
  rank: number;

  @IsNumber()
  profitLoss: number;

  @IsNumber()
  profitLossPercent: number;

  @IsString()
  lastUpdated: string;
}

export class AdminLeaderboardResponseDto extends LeaderboardResponseDto {
  @IsBoolean()
  isVisible: boolean;

  @IsString()
  userId: string;
}

export class UpdateLeaderboardVisibilityDto {
  @IsBoolean()
  isVisible: boolean;
}

export class LeaderboardStatsDto {
  @IsNumber()
  totalParticipants: number;

  @IsNumber()
  visibleParticipants: number;

  @IsNumber()
  averageAssets: number;

  @IsNumber()
  topAssets: number;

  @IsString()
  lastUpdated: string;
}
