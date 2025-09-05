import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import type { BuyOrderDto, SellOrderDto } from './portfolios.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post('buy')
  async buyStock(
    @Req() req: AuthenticatedRequest,
    @Body() buyOrder: BuyOrderDto,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestException('인증된 사용자 정보를 찾을 수 없습니다.');
      }
      const userId = req.user.id;
      const result = await this.portfoliosService.buyStock(userId, buyOrder);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('sell')
  async sellStock(
    @Req() req: AuthenticatedRequest,
    @Body() sellOrder: SellOrderDto,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new BadRequestException('인증된 사용자 정보를 찾을 수 없습니다.');
      }
      const userId = req.user.id;
      const result = await this.portfoliosService.sellStock(userId, sellOrder);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getUserPortfolio(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.portfoliosService.getUserPortfolio(userId);
    return result;
  }

  @Get('transactions')
  async getUserTransactions(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.portfoliosService.getUserTransactions(userId);
    return result;
  }

  @Get('balance')
  async getUserBalance(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.portfoliosService.getUserBalance(userId);
    return result;
  }

  @Get(':stockId')
  async getPortfolioByStock(
    @Req() req: AuthenticatedRequest,
    @Param('stockId') stockId: string,
  ) {
    const userId = req.user.id;
    const result = await this.portfoliosService.getPortfolioByStock(
      userId,
      stockId,
    );
    return result;
  }

  @Get('volume/stats')
  async getAllStockVolumeStats() {
    return await this.portfoliosService.getAllStockVolumeStats();
  }

  @Get('volume/stats/:stockId')
  async getStockVolumeStats(@Param('stockId') stockId: string) {
    return await this.portfoliosService.getStockVolumeStats(stockId);
  }
}
