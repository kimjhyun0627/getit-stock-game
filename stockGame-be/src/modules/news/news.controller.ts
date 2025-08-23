import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import {
  CreateNewsDto,
  UpdateNewsDto,
  PublishNewsDto,
  NewsResponseDto,
} from '../../common/dto/news.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { News } from '../../common/entities/news.entity';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 공개 API - 모든 사용자가 접근 가능
  @Public()
  @Get()
  async findAll(): Promise<NewsResponseDto[]> {
    console.log('findAll');
    return await this.newsService.findAll();
  }

  @Public()
  @Get('published')
  async findPublished(): Promise<NewsResponseDto[]> {
    return await this.newsService.findPublished();
  }

  @Public()
  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
  ): Promise<NewsResponseDto[]> {
    return await this.newsService.findByCategory(category);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<News> {
    return await this.newsService.findOne(id);
  }

  // 관리자 전용 API - JWT + RolesGuard 필요
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createNewsDto: CreateNewsDto): Promise<News> {
    try {
      const result = await this.newsService.create(createNewsDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<News> {
    try {
      const result = await this.newsService.update(id, updateNewsDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async publish(
    @Param('id') id: string,
    @Body() publishDto: PublishNewsDto,
  ): Promise<News> {
    try {
      const result = await this.newsService.publish(id, publishDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.newsService.remove(id);
    return { message: '뉴스가 성공적으로 삭제되었습니다.' };
  }
}
