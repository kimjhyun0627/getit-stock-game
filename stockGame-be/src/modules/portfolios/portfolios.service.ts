import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(PortfoliosService.name);

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
    this.logger.log(
      `💰 사용자 ${userId}가 주식 ${buyOrder.stockId}를 ${buyOrder.quantity}주 매수합니다.`,
    );
    this.logger.log('🔄 SQLite 데이터베이스에서 트랜잭션을 시작합니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 사용자 정보 조회
      this.logger.log(`👤 SQLite에서 사용자 ${userId} 정보를 조회합니다.`);
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`⚠️ SQLite에서 사용자 ${userId}를 찾을 수 없습니다.`);
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      this.logger.log(
        `✅ SQLite에서 사용자 "${user.name}" 조회 성공 (잔고: ${user.balance})`,
      );

      // 2. 주식 정보 조회
      this.logger.log(
        `📊 SQLite에서 주식 ${buyOrder.stockId} 정보를 조회합니다.`,
      );
      const stock = await queryRunner.manager.findOne(Stock, {
        where: { id: buyOrder.stockId },
      });
      if (!stock) {
        this.logger.warn(
          `⚠️ SQLite에서 주식 ${buyOrder.stockId}를 찾을 수 없습니다.`,
        );
        throw new NotFoundException('주식을 찾을 수 없습니다.');
      }
      this.logger.log(
        `✅ SQLite에서 주식 "${stock.name}" (${stock.symbol}) 조회 성공`,
      );

      // 3. 잔고 확인
      const totalCost = buyOrder.price * buyOrder.quantity;
      this.logger.log(
        `💵 매수 비용: ${totalCost}원, 사용자 잔고: ${user.balance}원`,
      );
      if (user.balance < totalCost) {
        this.logger.warn(
          `⚠️ 잔고 부족: 필요 ${totalCost}원, 보유 ${user.balance}원`,
        );
        throw new BadRequestException('잔고가 부족합니다.');
      }

      // 4. 기존 포트폴리오 조회
      this.logger.log(`📁 SQLite에서 기존 포트폴리오를 조회합니다.`);
      let portfolio = await queryRunner.manager.findOne(Portfolio, {
        where: { userId, stockId: buyOrder.stockId },
      });

      if (portfolio) {
        // 기존 보유분이 있는 경우
        this.logger.log(
          `📈 기존 포트폴리오 업데이트: ${portfolio.quantity}주 → ${portfolio.quantity + buyOrder.quantity}주`,
        );
        const newTotalQuantity = portfolio.quantity + buyOrder.quantity;
        const newTotalCost =
          portfolio.averagePrice * portfolio.quantity + totalCost;
        portfolio.quantity = newTotalQuantity;
        portfolio.averagePrice = newTotalCost / newTotalQuantity;
        portfolio.updatedAt = new Date();
      } else {
        // 새로운 보유분
        this.logger.log(`🆕 새로운 포트폴리오를 생성합니다.`);
        portfolio = queryRunner.manager.create(Portfolio, {
          userId,
          stockId: buyOrder.stockId,
          quantity: buyOrder.quantity,
          averagePrice: buyOrder.price,
        });
      }

      // 5. 포트폴리오 저장
      this.logger.log(`💾 SQLite에 포트폴리오를 저장합니다.`);
      const savedPortfolio = await queryRunner.manager.save(
        Portfolio,
        portfolio,
      );

      // 6. 사용자 잔고 차감
      this.logger.log(
        `💰 사용자 잔고를 ${user.balance} → ${user.balance - totalCost}로 차감합니다.`,
      );
      user.balance -= totalCost;
      await queryRunner.manager.save(User, user);

      // 7. 거래 내역 저장
      this.logger.log(`📝 SQLite에 매수 거래 내역을 저장합니다.`);
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
      this.logger.log(
        `📊 주식 거래량을 ${stock.volume} → ${stock.volume + buyOrder.quantity}로 증가시킵니다.`,
      );
      stock.increaseVolume(buyOrder.quantity);
      await queryRunner.manager.save(Stock, stock);

      await queryRunner.commitTransaction();
      this.logger.log(
        `✅ SQLite에서 매수 트랜잭션이 성공적으로 완료되었습니다.`,
      );
      return savedPortfolio;
    } catch (error) {
      this.logger.error(`❌ SQLite 트랜잭션 실패: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sellStock(userId: string, sellOrder: SellOrderDto): Promise<Portfolio> {
    this.logger.log(
      `💰 사용자 ${userId}가 주식 ${sellOrder.stockId}를 ${sellOrder.quantity}주 매도합니다.`,
    );
    this.logger.log('🔄 SQLite 데이터베이스에서 트랜잭션을 시작합니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 사용자 정보 조회
      this.logger.log(`👤 SQLite에서 사용자 ${userId} 정보를 조회합니다.`);
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`⚠️ SQLite에서 사용자 ${userId}를 찾을 수 없습니다.`);
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      this.logger.log(
        `✅ SQLite에서 사용자 "${user.name}" 조회 성공 (잔고: ${user.balance})`,
      );

      // 2. 주식 정보 조회
      this.logger.log(
        `📊 SQLite에서 주식 ${sellOrder.stockId} 정보를 조회합니다.`,
      );
      const stock = await queryRunner.manager.findOne(Stock, {
        where: { id: sellOrder.stockId },
      });
      if (!stock) {
        this.logger.warn(
          `⚠️ SQLite에서 주식 ${sellOrder.stockId}를 찾을 수 없습니다.`,
        );
        throw new NotFoundException('주식을 찾을 수 없습니다.');
      }
      this.logger.log(
        `✅ SQLite에서 주식 "${stock.name}" (${stock.symbol}) 조회 성공`,
      );

      // 3. 포트폴리오 조회
      this.logger.log(`📁 SQLite에서 포트폴리오를 조회합니다.`);
      const portfolio = await queryRunner.manager.findOne(Portfolio, {
        where: { userId, stockId: sellOrder.stockId },
      });
      if (!portfolio) {
        this.logger.warn(`⚠️ SQLite에서 포트폴리오를 찾을 수 없습니다.`);
        throw new BadRequestException('보유하고 있지 않은 주식입니다.');
      }

      if (portfolio.quantity < sellOrder.quantity) {
        this.logger.warn(
          `⚠️ 보유 수량 부족: 보유 ${portfolio.quantity}주, 매도 요청 ${sellOrder.quantity}주`,
        );
        throw new BadRequestException(
          '보유 수량보다 많은 수량을 매도할 수 없습니다.',
        );
      }

      // 4. 매도 처리
      const sellAmount = sellOrder.price * sellOrder.quantity;
      const remainingQuantity = portfolio.quantity - sellOrder.quantity;
      this.logger.log(
        `📊 매도 처리: ${portfolio.quantity}주 → ${remainingQuantity}주, 매도 금액: ${sellAmount}원`,
      );

      if (remainingQuantity === 0) {
        // 전량 매도 시 포트폴리오 삭제
        this.logger.log(`🗑️ 전량 매도로 포트폴리오를 삭제합니다.`);
        await queryRunner.manager.remove(Portfolio, portfolio);
      } else {
        // 부분 매도 시 수량만 차감 (평균 매수가는 유지)
        this.logger.log(`📝 부분 매도로 포트폴리오를 업데이트합니다.`);
        portfolio.quantity = remainingQuantity;
        portfolio.updatedAt = new Date();
        await queryRunner.manager.save(Portfolio, portfolio);
      }

      // 5. 사용자 잔고 증가
      this.logger.log(
        `💰 사용자 잔고를 ${user.balance} → ${user.balance + sellAmount}로 증가시킵니다.`,
      );
      user.balance += sellAmount;
      await queryRunner.manager.save(User, user);

      // 6. 거래 내역 저장
      this.logger.log(`📝 SQLite에 매도 거래 내역을 저장합니다.`);
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
      this.logger.log(
        `📊 주식 거래량을 ${stock.volume} → ${stock.volume + sellOrder.quantity}로 증가시킵니다.`,
      );
      stock.increaseVolume(sellOrder.quantity);
      await queryRunner.manager.save(Stock, stock);

      await queryRunner.commitTransaction();
      this.logger.log(
        `✅ SQLite에서 매도 트랜잭션이 성공적으로 완료되었습니다.`,
      );
      return portfolio;
    } catch (error) {
      this.logger.error(`❌ SQLite 트랜잭션 실패: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserPortfolio(userId: string): Promise<PortfolioResponseDto[]> {
    this.logger.log(
      `📁 사용자 ${userId}의 포트폴리오를 SQLite 데이터베이스에서 조회합니다.`,
    );
    const portfolios = await this.portfolioRepository.find({
      where: { userId },
      relations: ['stock'],
      order: { updatedAt: 'DESC' },
    });

    this.logger.log(
      `✅ SQLite에서 사용자 ${userId}의 ${portfolios.length}개 포트폴리오를 조회했습니다.`,
    );
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
    this.logger.log(
      `📝 사용자 ${userId}의 거래 내역을 SQLite 데이터베이스에서 조회합니다.`,
    );
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['stock'],
      order: {
        createdAt: 'DESC', // 거래 생성 시간 기준 최신순 정렬
        id: 'DESC', // 같은 시간에 생성된 경우 ID 기준으로 정렬
      },
    });

    this.logger.log(
      `✅ SQLite에서 사용자 ${userId}의 ${transactions.length}개 거래 내역을 조회했습니다.`,
    );
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
    this.logger.log(
      `🔍 사용자 ${userId}의 주식 ${stockId} 포트폴리오를 SQLite 데이터베이스에서 조회합니다.`,
    );
    const portfolio = await this.portfolioRepository.findOne({
      where: { userId, stockId },
      relations: ['stock'],
    });

    if (portfolio) {
      this.logger.log(
        `✅ SQLite에서 포트폴리오 조회 성공: ${portfolio.quantity}주`,
      );
    } else {
      this.logger.log(`ℹ️ SQLite에서 포트폴리오를 찾을 수 없습니다.`);
    }

    return portfolio;
  }

  async getUserBalance(userId: string): Promise<{ balance: number }> {
    this.logger.log(
      `💰 사용자 ${userId}의 잔고를 SQLite 데이터베이스에서 조회합니다.`,
    );
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['balance'],
    });

    if (!user) {
      this.logger.warn(`⚠️ SQLite에서 사용자 ${userId}를 찾을 수 없습니다.`);
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    this.logger.log(
      `✅ SQLite에서 사용자 ${userId}의 잔고 조회 성공: ${user.balance}원`,
    );
    return { balance: user.balance };
  }

  // 주식별 거래량 통계 조회
  async getStockVolumeStats(stockId: string): Promise<{
    totalVolume: number;
    buyVolume: number;
    sellVolume: number;
    lastUpdated: Date;
  }> {
    this.logger.log(
      `📊 주식 ${stockId}의 거래량 통계를 SQLite 데이터베이스에서 조회합니다.`,
    );
    const stock = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stock) {
      this.logger.warn(`⚠️ SQLite에서 주식 ${stockId}를 찾을 수 없습니다.`);
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

    const result = {
      totalVolume: stock.volume,
      buyVolume: Number(buyStats?.totalQuantity || 0),
      sellVolume: Number(sellStats?.totalQuantity || 0),
      lastUpdated: stock.updatedAt,
    };

    this.logger.log(
      `✅ SQLite에서 주식 ${stockId} 거래량 통계 조회 완료: 총 ${result.totalVolume}, 매수 ${result.buyVolume}, 매도 ${result.sellVolume}`,
    );
    return result;
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
    this.logger.log(
      '📊 모든 주식의 거래량 통계를 SQLite 데이터베이스에서 조회합니다.',
    );
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

    const sortedStats = stats.sort((a, b) => b.totalVolume - a.totalVolume);
    this.logger.log(
      `✅ SQLite에서 ${stocks.length}개 주식의 거래량 통계 조회 완료`,
    );
    return sortedStats;
  }
}
