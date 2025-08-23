import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async findAll(): Promise<NewsResponseDto[]> {
    const news = await this.newsRepository.find({
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

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
    const news = await this.newsRepository.find({
      where: { isPublished: true },
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

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
    const newsItem = await this.newsRepository.findOne({ where: { id } });
    if (!newsItem) {
      throw new NotFoundException(`ID ${id}인 뉴스를 찾을 수 없습니다.`);
    }
    return newsItem;
  }

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const newNews = this.newsRepository.create(createNewsDto);
    return await this.newsRepository.save(newNews);
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<News> {
    const newsItem = await this.findOne(id);

    if (updateNewsDto.isPublished !== undefined) {
      if (updateNewsDto.isPublished) {
        newsItem.publish();
      } else {
        newsItem.unpublish();
      }
    }

    if (updateNewsDto.title !== undefined) {
      newsItem.title = updateNewsDto.title;
    }

    if (updateNewsDto.summary !== undefined) {
      newsItem.summary = updateNewsDto.summary;
    }

    if (updateNewsDto.content !== undefined) {
      newsItem.content = updateNewsDto.content;
    }

    if (updateNewsDto.category !== undefined) {
      newsItem.category = updateNewsDto.category;
    }

    newsItem.updatedAt = new Date();

    const savedNews = await this.newsRepository.save(newsItem);
    return savedNews;
  }

  async publish(id: string, publishDto: PublishNewsDto): Promise<News> {
    const newsItem = await this.findOne(id);

    if (publishDto.isPublished) {
      newsItem.publish();
    } else {
      newsItem.unpublish();
    }

    return await this.newsRepository.save(newsItem);
  }

  async remove(id: string): Promise<void> {
    const newsItem = await this.findOne(id);
    await this.newsRepository.remove(newsItem);
  }

  async findByCategory(category: string): Promise<NewsResponseDto[]> {
    const news = await this.newsRepository.find({
      where: { category },
      order: { updatedAt: 'DESC' }, // 수정 시간 기준 최신순 정렬
    });

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
