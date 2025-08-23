import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StocksModule } from '../stocks/stocks.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [StocksModule, NewsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
