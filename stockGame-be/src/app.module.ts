import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { NewsModule } from './modules/news/news.module';
import { AdminModule } from './modules/admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

import { User } from './users/entities/user.entity';
import { UserSession } from './auth/entities/user-session.entity';
import { Stock } from './common/entities/stock.entity';
import { News } from './common/entities/news.entity';
import { Transaction } from './modules/portfolios/entities/transaction.entity';
import { Portfolio } from './modules/portfolios/entities/portfolio.entity';
import { LeaderboardEntry } from './modules/leaderboard/entities/leaderboard-entry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'stockgame.db',
      entities: [
        User,
        UserSession,
        Stock,
        News,
        Transaction,
        Portfolio,
        LeaderboardEntry,
      ],
      synchronize: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '2h' },
    }),
    HttpModule,
    AuthModule,
    UsersModule,
    StocksModule,
    NewsModule,
    AdminModule,
    SeedModule,
    PortfoliosModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
