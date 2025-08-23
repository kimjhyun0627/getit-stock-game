import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Stock } from '../common/entities/stock.entity';
import { News } from '../common/entities/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, News])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
