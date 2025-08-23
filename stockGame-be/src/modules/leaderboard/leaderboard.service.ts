import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { User } from '../../users/entities/user.entity';
import { Portfolio } from '../portfolios/entities/portfolio.entity';
import { Stock } from '../../common/entities/stock.entity';
import {
  LeaderboardResponseDto,
  AdminLeaderboardResponseDto,
  LeaderboardStatsDto,
} from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(LeaderboardEntry)
    private leaderboardRepository: Repository<LeaderboardEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    private dataSource: DataSource,
  ) {}

  /**
   * 모든 사용자의 자산을 계산하고 리더보드를 업데이트
   */
  async updateLeaderboard(): Promise<void> {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'nickname', 'balance', 'role', 'isLeaderboardVisible'],
      });

      const stockPrices = await this.getStockPrices();
      const leaderboardEntries: Partial<LeaderboardEntry>[] = [];

      for (const user of users) {
        const userPortfolio = await this.portfolioRepository.find({
          where: { userId: user.id },
          relations: ['stock'],
        });

        let stockValue = 0;
        for (const portfolio of userPortfolio) {
          const currentPrice = stockPrices[portfolio.stockId] || 0;
          stockValue += portfolio.quantity * currentPrice;
        }

        const totalAssets = user.balance + stockValue;
        const initialBalance = 10000000;
        const profitLoss = totalAssets - initialBalance;
        const profitLossPercent = (profitLoss / initialBalance) * 100;

        leaderboardEntries.push({
          userId: user.id,
          username: user.nickname,
          totalAssets: Number(totalAssets),
          cashBalance: Number(user.balance),
          stockValue: Number(stockValue),
          profitLoss: Number(profitLoss),
          profitLossPercent: Number(profitLossPercent),
          isVisible: user.isLeaderboardVisible ?? true, // 기본값은 true, 설정값이 있으면 그 값 사용
        });
      }

      // 보이는 사용자만 등수 계산에 포함
      const visibleEntries = leaderboardEntries.filter(
        (entry) => entry.isVisible,
      );

      // 보이는 사용자들을 자산 순으로 정렬
      visibleEntries.sort(
        (a, b) => (b.totalAssets || 0) - (a.totalAssets || 0),
      );

      // 보이는 사용자들에게 연속적인 등수 부여 (1, 2, 3...)
      visibleEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // 숨김 처리된 사용자는 등수 없음 (rank = 0)
      leaderboardEntries.forEach((entry) => {
        if (!entry.isVisible) {
          entry.rank = 0;
        }
      });

      await this.updateLeaderboardDatabase(leaderboardEntries);
    } catch (error) {
      this.logger.error('리더보드 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 주식 가격 정보 조회
   */
  private async getStockPrices(): Promise<Record<string, number>> {
    const stocks = await this.stockRepository.find({
      select: ['id', 'currentPrice'],
    });

    const prices: Record<string, number> = {};
    stocks.forEach((stock) => {
      prices[stock.id] = stock.currentPrice;
    });

    return prices;
  }

  /**
   * 리더보드 데이터베이스 업데이트
   */
  private async updateLeaderboardDatabase(
    entries: Partial<LeaderboardEntry>[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 기존 데이터 삭제
      await queryRunner.manager.clear(LeaderboardEntry);

      // 새 데이터 삽입
      for (const entry of entries) {
        const leaderboardEntry = new LeaderboardEntry();
        Object.assign(leaderboardEntry, entry);
        await queryRunner.manager.save(leaderboardEntry);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 공개 리더보드 조회 (상위 100명)
   */
  async getPublicLeaderboard(): Promise<LeaderboardResponseDto[]> {
    const entries = await this.leaderboardRepository.find({
      where: { isVisible: true, rank: MoreThan(0) }, // 보이는 사용자이면서 등수가 0보다 큰 사용자만
      order: { rank: 'ASC' },
      take: 100,
    });

    return entries.map((entry) => ({
      id: entry.id,
      username: entry.username,
      totalAssets: entry.totalAssets,
      cashBalance: entry.cashBalance,
      stockValue: entry.stockValue,
      rank: entry.rank,
      profitLoss: entry.profitLoss,
      profitLossPercent: entry.profitLossPercent,
      lastUpdated: entry.lastUpdated.toISOString(),
    }));
  }

  /**
   * 관리자용 전체 리더보드 조회
   */
  async getAdminLeaderboard(): Promise<AdminLeaderboardResponseDto[]> {
    const entries = await this.leaderboardRepository.find({
      order: { rank: 'ASC' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      username: entry.username,
      totalAssets: entry.totalAssets,
      cashBalance: entry.cashBalance,
      stockValue: entry.stockValue,
      rank: entry.rank,
      profitLoss: entry.profitLoss,
      profitLossPercent: entry.profitLossPercent,
      isVisible: entry.isVisible,
      lastUpdated: entry.lastUpdated.toISOString(),
    }));
  }

  /**
   * 사용자 리더보드 노출 여부 토글
   */
  async toggleUserVisibility(
    userId: string,
    isVisible: boolean,
  ): Promise<void> {
    // 사용자 테이블 업데이트
    await this.userRepository.update(userId, {
      isLeaderboardVisible: isVisible,
    });

    // 리더보드 엔트리 업데이트
    await this.leaderboardRepository.update({ userId }, { isVisible });

    // 리더보드 전체 재계산 (등수 재정렬)
    await this.updateLeaderboard();
  }

  /**
   * 리더보드 통계 정보 조회
   */
  async getLeaderboardStats(): Promise<LeaderboardStatsDto> {
    const totalEntries = await this.leaderboardRepository.count();
    const visibleEntries = await this.leaderboardRepository.count({
      where: { isVisible: true },
    });

    const avgResult = await this.leaderboardRepository
      .createQueryBuilder('entry')
      .select('AVG(entry.totalAssets)', 'average')
      .where('entry.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    const topResult = await this.leaderboardRepository
      .createQueryBuilder('entry')
      .select('MAX(entry.totalAssets)', 'top')
      .where('entry.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    const lastUpdated = await this.leaderboardRepository
      .createQueryBuilder('entry')
      .select('MAX(entry.lastUpdated)', 'lastUpdated')
      .getRawOne();

    return {
      totalParticipants: totalEntries,
      visibleParticipants: visibleEntries,
      averageAssets: parseFloat(avgResult?.average || '0'),
      topAssets: parseFloat(topResult?.top || '0'),
      lastUpdated:
        lastUpdated?.lastUpdated?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 5분마다 자동 업데이트 (스케줄링)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.updateLeaderboard();
  }

  /**
   * 강제 리프레시 (관리자용)
   */
  async forceRefresh(): Promise<void> {
    await this.updateLeaderboard();
  }
}
