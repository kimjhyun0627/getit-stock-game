import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { User } from '../../users/entities/user.entity';
import { Portfolio } from '../portfolios/entities/portfolio.entity';
import { Stock } from '../../common/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardEntry, User, Portfolio, Stock]),
    ScheduleModule.forRoot(),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
