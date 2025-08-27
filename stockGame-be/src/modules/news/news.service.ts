import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../common/entities/news.entity';
import {
  CreateNewsDto,
  UpdateNewsDto,
  PublishNewsDto,
  NewsResponseDto,
} from '../../common/dto/news.dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async findAll(): Promise<NewsResponseDto[]> {
    this.logger.log(
      '📰 모든 뉴스 데이터를 SQLite 데이터베이스에서 조회합니다.',
    );
    const news = await this.newsRepository.find({
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

    this.logger.log(`✅ SQLite에서 ${news.length}개의 뉴스를 조회했습니다.`);
    return news.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async findPublished(): Promise<NewsResponseDto[]> {
    this.logger.log(
      '📰 발행된 뉴스 데이터를 SQLite 데이터베이스에서 조회합니다.',
    );
    const news = await this.newsRepository.find({
      where: { isPublished: true },
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

    this.logger.log(
      `✅ SQLite에서 ${news.length}개의 발행된 뉴스를 조회했습니다.`,
    );
    return news.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<News> {
    this.logger.log(`🔍 ID ${id}인 뉴스를 SQLite 데이터베이스에서 조회합니다.`);
    const newsItem = await this.newsRepository.findOne({ where: { id } });
    if (!newsItem) {
      this.logger.warn(`⚠️ SQLite에서 ID ${id}인 뉴스를 찾을 수 없습니다.`);
      throw new NotFoundException(`ID ${id}인 뉴스를 찾을 수 없습니다.`);
    }
    this.logger.log(`✅ SQLite에서 뉴스 "${newsItem.title}" 조회 성공`);
    return newsItem;
  }

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    this.logger.log(
      `➕ 새 뉴스 "${createNewsDto.title}"을 SQLite 데이터베이스에 생성합니다.`,
    );
    const newNews = this.newsRepository.create(createNewsDto);
    const savedNews = await this.newsRepository.save(newNews);
    this.logger.log(`✅ SQLite에 뉴스 "${savedNews.title}" 생성 완료`);
    return savedNews;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<News> {
    this.logger.log(
      `🔄 ID ${id}인 뉴스를 SQLite 데이터베이스에서 업데이트합니다.`,
    );
    const newsItem = await this.findOne(id);

    if (updateNewsDto.isPublished !== undefined) {
      if (updateNewsDto.isPublished) {
        this.logger.log(
          `📢 뉴스 "${newsItem.title}"을 발행 상태로 변경합니다.`,
        );
        newsItem.publish();
      } else {
        this.logger.log(
          `📝 뉴스 "${newsItem.title}"을 미발행 상태로 변경합니다.`,
        );
        newsItem.unpublish();
      }
    }

    if (updateNewsDto.title !== undefined) {
      this.logger.log(
        `📝 뉴스 제목을 "${newsItem.title}" → "${updateNewsDto.title}"로 업데이트`,
      );
      newsItem.title = updateNewsDto.title;
    }

    if (updateNewsDto.summary !== undefined) {
      this.logger.log(`📋 뉴스 요약을 업데이트합니다.`);
      newsItem.summary = updateNewsDto.summary;
    }

    if (updateNewsDto.content !== undefined) {
      this.logger.log(`📄 뉴스 내용을 업데이트합니다.`);
      newsItem.content = updateNewsDto.content;
    }

    if (updateNewsDto.category !== undefined) {
      this.logger.log(
        `🏷️ 뉴스 카테고리를 ${newsItem.category} → ${updateNewsDto.category}로 업데이트`,
      );
      newsItem.category = updateNewsDto.category;
    }

    newsItem.updatedAt = new Date();

    const savedNews = await this.newsRepository.save(newsItem);
    this.logger.log(`✅ SQLite에서 뉴스 "${savedNews.title}" 업데이트 완료`);
    return savedNews;
  }

  async publish(id: string, publishDto: PublishNewsDto): Promise<News> {
    this.logger.log(
      `📢 ID ${id}인 뉴스의 발행 상태를 SQLite 데이터베이스에서 변경합니다.`,
    );
    const newsItem = await this.findOne(id);

    if (publishDto.isPublished) {
      this.logger.log(`📢 뉴스 "${newsItem.title}"을 발행합니다.`);
      newsItem.publish();
    } else {
      this.logger.log(`📝 뉴스 "${newsItem.title}"을 미발행으로 변경합니다.`);
      newsItem.unpublish();
    }

    const savedNews = await this.newsRepository.save(newsItem);
    this.logger.log(
      `✅ SQLite에서 뉴스 "${savedNews.title}" 발행 상태 변경 완료`,
    );
    return savedNews;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`🗑️ ID ${id}인 뉴스를 SQLite 데이터베이스에서 삭제합니다.`);
    const newsItem = await this.findOne(id);
    await this.newsRepository.remove(newsItem);
    this.logger.log(`✅ SQLite에서 뉴스 "${newsItem.title}" 삭제 완료`);
  }

  async findByCategory(category: string): Promise<NewsResponseDto[]> {
    this.logger.log(
      `🏷️ 카테고리 "${category}"의 뉴스를 SQLite 데이터베이스에서 조회합니다.`,
    );
    const news = await this.newsRepository.find({
      where: { category },
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

    this.logger.log(
      `✅ SQLite에서 카테고리 "${category}"의 ${news.length}개 뉴스를 조회했습니다.`,
    );
    return news.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }
}
