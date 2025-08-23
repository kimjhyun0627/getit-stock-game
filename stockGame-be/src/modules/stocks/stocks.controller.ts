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
import { StocksService } from './stocks.service';
import {
  CreateStockDto,
  UpdateStockDto,
  UpdateStockPriceDto,
  UpdateStockVolumeDto,
} from '../../common/dto/stock.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Stock } from '../../common/entities/stock.entity';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  // 공개 API - 모든 사용자가 접근 가능
  @Public()
  @Get()
  async findAll(): Promise<Stock[]> {
    return await this.stocksService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Stock> {
    return await this.stocksService.findOne(id);
  }

  // 관리자 전용 API - JWT + RolesGuard 필요
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createStockDto: CreateStockDto): Promise<Stock> {
    return await this.stocksService.create(createStockDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    try {
      const result = await this.stocksService.update(id, updateStockDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id/price')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePrice(
    @Param('id') id: string,
    @Body() updatePriceDto: UpdateStockPriceDto,
  ): Promise<Stock> {
    return await this.stocksService.updatePrice(id, updatePriceDto);
  }

  @Put(':id/volume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateVolume(
    @Param('id') id: string,
    @Body() updateVolumeDto: UpdateStockVolumeDto,
  ): Promise<Stock> {
    return await this.stocksService.updateVolume(id, updateVolumeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.stocksService.remove(id);
    return { message: '주식이 성공적으로 삭제되었습니다.' };
  }

  // 주식 가격 시뮬레이션 (관리자 전용)
  @Post('simulate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async simulatePriceChanges(): Promise<{ message: string }> {
    await this.stocksService.simulatePriceChanges();
    return { message: '주식 가격 시뮬레이션이 실행되었습니다.' };
  }
}
