import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Transaction } from './entities/transaction.entity';
import { Stock } from '../../common/entities/stock.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionType } from './entities/transaction.entity';
import {
  PortfolioResponseDto,
  TransactionResponseDto,
} from './dto/portfolio.dto';

export interface BuyOrderDto {
  stockId: string;
  quantity: number;
  price: number;
}

export interface SellOrderDto {
  stockId: string;
  quantity: number;
  price: number;
}

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async buyStock(userId: string, buyOrder: BuyOrderDto): Promise<Portfolio> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 사용자 정보 조회
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 2. 주식 정보 조회
      const stock = await queryRunner.manager.findOne(Stock, {
        where: { id: buyOrder.stockId },
      });
      if (!stock) {
        throw new NotFoundException('주식을 찾을 수 없습니다.');
      }

      // 3. 잔고 확인
      const totalCost = buyOrder.price * buyOrder.quantity;
      if (user.balance < totalCost) {
        throw new BadRequestException('잔고가 부족합니다.');
      }

      // 4. 기존 포트폴리오 조회
      let portfolio = await queryRunner.manager.findOne(Portfolio, {
        where: { userId, stockId: buyOrder.stockId },
      });

      if (portfolio) {
        // 기존 보유분이 있는 경우
        const newTotalQuantity = portfolio.quantity + buyOrder.quantity;
        const newTotalCost =
          portfolio.averagePrice * portfolio.quantity + totalCost;
        portfolio.quantity = newTotalQuantity;
        portfolio.averagePrice = newTotalCost / newTotalQuantity;
        portfolio.updatedAt = new Date();
      } else {
        // 새로운 보유분
        portfolio = queryRunner.manager.create(Portfolio, {
          userId,
          stockId: buyOrder.stockId,
          quantity: buyOrder.quantity,
          averagePrice: buyOrder.price,
        });
      }

      // 5. 포트폴리오 저장
      const savedPortfolio = await queryRunner.manager.save(
        Portfolio,
        portfolio,
      );

      // 6. 사용자 잔고 차감
      user.balance -= totalCost;
      await queryRunner.manager.save(User, user);

      // 7. 거래 내역 저장
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        stockId: buyOrder.stockId,
        type: TransactionType.BUY,
        quantity: buyOrder.quantity,
        price: buyOrder.price,
        totalAmount: totalCost,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // 8. 주식 거래량 업데이트
      stock.increaseVolume(buyOrder.quantity);
      await queryRunner.manager.save(Stock, stock);

      await queryRunner.commitTransaction();
      return savedPortfolio;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sellStock(userId: string, sellOrder: SellOrderDto): Promise<Portfolio> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 사용자 정보 조회
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 2. 주식 정보 조회
      const stock = await queryRunner.manager.findOne(Stock, {
        where: { id: sellOrder.stockId },
      });
      if (!stock) {
        throw new NotFoundException('주식을 찾을 수 없습니다.');
      }

      // 3. 포트폴리오 조회
      const portfolio = await queryRunner.manager.findOne(Portfolio, {
        where: { userId, stockId: sellOrder.stockId },
      });
      if (!portfolio) {
        throw new BadRequestException('보유하고 있지 않은 주식입니다.');
      }

      if (portfolio.quantity < sellOrder.quantity) {
        throw new BadRequestException(
          '보유 수량보다 많은 수량을 매도할 수 없습니다.',
        );
      }

      // 4. 매도 처리
      const sellAmount = sellOrder.price * sellOrder.quantity;
      const remainingQuantity = portfolio.quantity - sellOrder.quantity;

      if (remainingQuantity === 0) {
        // 전량 매도 시 포트폴리오 삭제
        await queryRunner.manager.remove(Portfolio, portfolio);
      } else {
        // 부분 매도 시 수량만 차감 (평균 매수가는 유지)
        portfolio.quantity = remainingQuantity;
        portfolio.updatedAt = new Date();
        await queryRunner.manager.save(Portfolio, portfolio);
      }

      // 5. 사용자 잔고 증가
      user.balance += sellAmount;
      await queryRunner.manager.save(User, user);

      // 6. 거래 내역 저장
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        stockId: sellOrder.stockId,
        type: TransactionType.SELL,
        quantity: sellOrder.quantity,
        price: sellOrder.price,
        totalAmount: sellAmount,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // 7. 주식 거래량 업데이트
      stock.increaseVolume(sellOrder.quantity);
      await queryRunner.manager.save(Stock, stock);

      await queryRunner.commitTransaction();
      return portfolio;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserPortfolio(userId: string): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.portfolioRepository.find({
      where: { userId },
      relations: ['stock'],
      order: { updatedAt: 'DESC' },
    });

    return portfolios.map((portfolio) => {
      const currentPrice = portfolio.stock.currentPrice;
      const totalValue = portfolio.quantity * currentPrice;
      const profitLoss =
        (currentPrice - portfolio.averagePrice) * portfolio.quantity;
      const profitLossPercent =
        ((currentPrice - portfolio.averagePrice) / portfolio.averagePrice) *
        100;

      return {
        stockId: portfolio.stockId,
        stockName: portfolio.stock.name,
        symbol: portfolio.stock.symbol,
        quantity: portfolio.quantity,
        averagePrice: portfolio.averagePrice,
        currentPrice: currentPrice,
        totalValue: totalValue,
        profitLoss: profitLoss,
        profitLossPercent: profitLossPercent,
      };
    });
  }

  async getUserTransactions(userId: string): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['stock'],
      order: {
        createdAt: 'DESC', // 거래 생성 시간 기준 최신순 정렬
        id: 'DESC', // 같은 시간에 생성된 경우 ID 기준으로 정렬
      },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      stockId: transaction.stockId,
      stockName: transaction.stock.name,
      symbol: transaction.stock.symbol,
      type: transaction.type === TransactionType.BUY ? 'buy' : 'sell',
      quantity: transaction.quantity,
      price: transaction.price,
      totalAmount: transaction.totalAmount,
      createdAt: transaction.createdAt.toISOString(),
    }));
  }

  async getPortfolioByStock(
    userId: string,
    stockId: string,
  ): Promise<Portfolio | null> {
    return await this.portfolioRepository.findOne({
      where: { userId, stockId },
      relations: ['stock'],
    });
  }

  async getUserBalance(userId: string): Promise<{ balance: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['balance'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return { balance: user.balance };
  }

  // 주식별 거래량 통계 조회
  async getStockVolumeStats(stockId: string): Promise<{
    totalVolume: number;
    buyVolume: number;
    sellVolume: number;
    lastUpdated: Date;
  }> {
    const stock = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stock) {
      throw new NotFoundException('주식을 찾을 수 없습니다.');
    }

    const [buyStats, sellStats] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.quantity)', 'totalQuantity')
        .where('transaction.stockId = :stockId', { stockId })
        .andWhere('transaction.type = :type', { type: TransactionType.BUY })
        .getRawOne(),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.quantity)', 'totalQuantity')
        .where('transaction.stockId = :stockId', { stockId })
        .andWhere('transaction.type = :type', { type: TransactionType.SELL })
        .getRawOne(),
    ]);

    return {
      totalVolume: stock.volume,
      buyVolume: Number(buyStats?.totalQuantity || 0),
      sellVolume: Number(sellStats?.totalQuantity || 0),
      lastUpdated: stock.updatedAt,
    };
  }

  // 전체 주식 거래량 통계 조회
  async getAllStockVolumeStats(): Promise<
    Array<{
      stockId: string;
      stockName: string;
      stockSymbol: string;
      totalVolume: number;
      buyVolume: number;
      sellVolume: number;
      lastUpdated: Date;
    }>
  > {
    const stocks = await this.stockRepository.find();
    const stats = await Promise.all(
      stocks.map(async (stock) => {
        const stockStats = await this.getStockVolumeStats(stock.id);
        return {
          stockId: stock.id,
          stockName: stock.name,
          stockSymbol: stock.symbol,
          ...stockStats,
        };
      }),
    );

    return stats.sort((a, b) => b.totalVolume - a.totalVolume);
  }
}
