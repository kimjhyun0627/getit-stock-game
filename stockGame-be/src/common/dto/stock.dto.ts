import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStockDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsNumber()
  @Min(0)
  currentPrice: number;

  @IsNumber()
  @Min(0)
  volume: number;
}

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;
}

export class UpdateStockPriceDto {
  @IsNumber()
  @Min(0)
  currentPrice: number;
}

export class UpdateStockVolumeDto {
  @IsNumber()
  @Min(0)
  volume: number;
}
