import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class BuyStockDto {
  @IsString()
  stockId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class SellStockDto {
  @IsString()
  stockId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class PortfolioResponseDto {
  stockId: string;
  stockName: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export class TransactionResponseDto {
  id: string;
  stockId: string;
  stockName: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  createdAt: string;
}
