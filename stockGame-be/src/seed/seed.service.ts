import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../common/entities/stock.entity';
import { News } from '../common/entities/news.entity';
import { stockSeeds } from './stock-seed';
import { newsSeeds } from './news-seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async seedStocks(): Promise<void> {
    const existingStocks = await this.stockRepository.count();
    if (existingStocks === 0) {
      for (const seed of stockSeeds) {
        const stock = this.stockRepository.create(seed);
        await this.stockRepository.save(stock);
      }
    } else {
      // 주식 데이터가 이미 존재합니다
    }
  }

  async seedNews(): Promise<void> {
    const existingNews = await this.newsRepository.count();
    if (existingNews === 0) {
      for (const seed of newsSeeds) {
        const news = this.newsRepository.create(seed);
        await this.newsRepository.save(news);
      }
    } else {
      // 뉴스 데이터가 이미 존재합니다
    }
  }

  async seedAll(): Promise<void> {
    await this.seedStocks();
    await this.seedNews();
  }
}
