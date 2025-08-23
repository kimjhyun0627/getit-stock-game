import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsString()
  content: string;

  @IsString()
  category: string; // 주식 심볼 또는 기본 카테고리 허용

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class NewsResponseDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string; // 주식 심볼 또는 기본 카테고리
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  category?: string; // 주식 심볼 또는 기본 카테고리 허용

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class PublishNewsDto {
  @IsBoolean()
  isPublished: boolean;
}
