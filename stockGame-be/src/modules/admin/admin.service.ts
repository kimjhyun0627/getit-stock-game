import { Injectable } from '@nestjs/common';
import { StocksService } from '../stocks/stocks.service';
import { NewsService } from '../news/news.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly stocksService: StocksService,
    private readonly newsService: NewsService,
  ) {}

  // 대시보드 통계
  async getDashboardStats() {
    const stocks = await this.stocksService.findAll();
    const news = await this.newsService.findAll();

    const publishedNews = await this.newsService.findPublished();
    const unpublishedNews = news.filter((item) => !item.isPublished);

    const totalStocks = stocks.length;
    const totalNews = news.length;
    const publishedNewsCount = publishedNews.length;
    const unpublishedNewsCount = unpublishedNews.length;

    // 주식 통계
    const stockStats = {
      total: totalStocks,
      rising: stocks.filter((s) => s.change > 0).length,
      falling: stocks.filter((s) => s.change < 0).length,
      unchanged: stocks.filter((s) => s.change === 0).length,
      totalVolume: stocks.reduce((sum, s) => sum + s.volume, 0),
    };

    // 뉴스 통계
    const newsStats = {
      total: totalNews,
      published: publishedNewsCount,
      unpublished: unpublishedNewsCount,
      byCategory: {
        economy: news.filter((n) => n.category === 'economy').length,
        technology: news.filter((n) => n.category === 'technology').length,
        politics: news.filter((n) => n.category === 'politics').length,
        sports: news.filter((n) => n.category === 'sports').length,
      },
    };

    return {
      stocks: stockStats,
      news: newsStats,
      lastUpdated: new Date(),
    };
  }

  // 시스템 상태 확인
  getSystemStatus() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  // 주식 가격 시뮬레이션 실행
  async runStockSimulation() {
    await this.stocksService.simulatePriceChanges();
    return {
      message: '주식 가격 시뮬레이션이 실행되었습니다.',
      timestamp: new Date(),
    };
  }

  // 데이터 백업 (실제로는 파일 시스템이나 데이터베이스에 저장)
  async backupData() {
    const stocks = await this.stocksService.findAll();
    const news = await this.newsService.findAll();

    return {
      message: '데이터 백업이 완료되었습니다.',
      timestamp: new Date(),
      stocksCount: stocks.length,
      newsCount: news.length,
    };
  }
}
