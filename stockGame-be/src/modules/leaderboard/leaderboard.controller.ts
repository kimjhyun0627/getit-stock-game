import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import {
  LeaderboardResponseDto,
  AdminLeaderboardResponseDto,
  UpdateLeaderboardVisibilityDto,
  LeaderboardStatsDto,
} from './dto/leaderboard.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * 공개 리더보드 조회 (인증 불필요)
   */
  @Get()
  @Public()
  async getPublicLeaderboard(): Promise<LeaderboardResponseDto[]> {
    return this.leaderboardService.getPublicLeaderboard();
  }

  /**
   * 관리자용 전체 리더보드 조회
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAdminLeaderboard(): Promise<AdminLeaderboardResponseDto[]> {
    return this.leaderboardService.getAdminLeaderboard();
  }

  /**
   * 리더보드 통계 정보 조회
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLeaderboardStats(): Promise<LeaderboardStatsDto> {
    return this.leaderboardService.getLeaderboardStats();
  }

  /**
   * 사용자 리더보드 노출 여부 토글
   */
  @Put('admin/:userId/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async toggleUserVisibility(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateLeaderboardVisibilityDto,
  ): Promise<void> {
    await this.leaderboardService.toggleUserVisibility(
      userId,
      updateDto.isVisible,
    );
  }

  /**
   * 강제 리더보드 리프레시
   */
  @Post('admin/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async forceRefresh(): Promise<void> {
    await this.leaderboardService.forceRefresh();
  }
}
