import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../../common/entities/stock.entity';
import {
  CreateStockDto,
  UpdateStockDto,
  UpdateStockPriceDto,
  UpdateStockVolumeDto,
} from '../../common/dto/stock.dto';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
  ) {}

  async findAll(): Promise<Stock[]> {
    this.logger.log(
      '📊 모든 주식 데이터를 SQLite 데이터베이스에서 조회합니다.',
    );
    const stocks = await this.stocksRepository.find();
    this.logger.log(`✅ SQLite에서 ${stocks.length}개의 주식을 조회했습니다.`);
    return stocks;
  }

  async findOne(id: string): Promise<Stock> {
    this.logger.log(`🔍 ID ${id}인 주식을 SQLite 데이터베이스에서 조회합니다.`);
    const stock = await this.stocksRepository.findOne({ where: { id } });
    if (!stock) {
      this.logger.warn(`⚠️ SQLite에서 ID ${id}인 주식을 찾을 수 없습니다.`);
      throw new NotFoundException(`ID ${id}인 주식을 찾을 수 없습니다.`);
    }
    this.logger.log(
      `✅ SQLite에서 주식 "${stock.name}" (${stock.symbol}) 조회 성공`,
    );
    return stock;
  }

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    this.logger.log(
      `➕ 새 주식 "${createStockDto.name}" (${createStockDto.symbol})을 SQLite 데이터베이스에 생성합니다.`,
    );

    // 종목코드 중복 확인
    if (!(await this.isSymbolUnique(createStockDto.symbol))) {
      this.logger.warn(
        `⚠️ SQLite에서 종목코드 ${createStockDto.symbol}가 이미 존재합니다.`,
      );
      throw new Error(
        `종목코드 ${createStockDto.symbol}는 이미 사용 중입니다.`,
      );
    }

    // 종목코드 유효성 검증
    if (!this.validateStockSymbol(createStockDto.symbol)) {
      this.logger.warn(
        `⚠️ 종목코드 ${createStockDto.symbol}가 유효하지 않습니다.`,
      );
      throw new Error(
        `종목코드 ${createStockDto.symbol}는 유효하지 않습니다. 6자리 숫자여야 합니다.`,
      );
    }

    const newStock = this.stocksRepository.create({
      ...createStockDto,
      previousPrice: createStockDto.currentPrice,
      change: 0,
      changePercent: 0,
    });

    const savedStock = await this.stocksRepository.save(newStock);
    this.logger.log(
      `✅ SQLite에 주식 "${savedStock.name}" (${savedStock.symbol}) 생성 완료`,
    );
    return savedStock;
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    this.logger.log(
      `🔄 ID ${id}인 주식을 SQLite 데이터베이스에서 업데이트합니다.`,
    );
    const stock = await this.findOne(id);

    if (updateStockDto.currentPrice !== undefined) {
      this.logger.log(
        `💰 주식 가격을 ${stock.currentPrice} → ${updateStockDto.currentPrice}로 업데이트`,
      );
      stock.updatePrice(updateStockDto.currentPrice);
    }

    if (updateStockDto.volume !== undefined) {
      this.logger.log(
        `📈 주식 거래량을 ${stock.volume} → ${updateStockDto.volume}로 업데이트`,
      );
      stock.updateVolume(updateStockDto.volume);
    }

    if (updateStockDto.name !== undefined) {
      this.logger.log(
        `📝 주식명을 "${stock.name}" → "${updateStockDto.name}"로 업데이트`,
      );
      stock.name = updateStockDto.name;
    }

    if (updateStockDto.symbol !== undefined) {
      this.logger.log(
        `🏷️ 종목코드를 ${stock.symbol} → ${updateStockDto.symbol}로 업데이트`,
      );
      stock.symbol = updateStockDto.symbol;
    }

    stock.updatedAt = new Date();

    const updatedStock = await this.stocksRepository.save(stock);
    this.logger.log(
      `✅ SQLite에서 주식 "${updatedStock.name}" (${updatedStock.symbol}) 업데이트 완료`,
    );
    return updatedStock;
  }

  async updatePrice(
    id: string,
    updatePriceDto: UpdateStockPriceDto,
  ): Promise<Stock> {
    this.logger.log(
      `💰 ID ${id}인 주식의 가격을 SQLite 데이터베이스에서 업데이트합니다.`,
    );
    const stock = await this.findOne(id);
    const oldPrice = stock.currentPrice;
    stock.updatePrice(updatePriceDto.currentPrice);
    const updatedStock = await this.stocksRepository.save(stock);
    this.logger.log(
      `✅ SQLite에서 주식 "${updatedStock.name}" 가격 업데이트: ${oldPrice} → ${updatedStock.currentPrice}`,
    );
    return updatedStock;
  }

  async updateVolume(
    id: string,
    updateVolumeDto: UpdateStockVolumeDto,
  ): Promise<Stock> {
    this.logger.log(
      `📈 ID ${id}인 주식의 거래량을 SQLite 데이터베이스에서 업데이트합니다.`,
    );
    const stock = await this.findOne(id);
    const oldVolume = stock.volume;
    stock.updateVolume(updateVolumeDto.volume);
    const updatedStock = await this.stocksRepository.save(stock);
    this.logger.log(
      `✅ SQLite에서 주식 "${updatedStock.name}" 거래량 업데이트: ${oldVolume} → ${updatedStock.volume}`,
    );
    return updatedStock;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`🗑️ ID ${id}인 주식을 SQLite 데이터베이스에서 삭제합니다.`);
    const stock = await this.findOne(id);
    await this.stocksRepository.remove(stock);
    this.logger.log(
      `✅ SQLite에서 주식 "${stock.name}" (${stock.symbol}) 삭제 완료`,
    );
  }

  // 주식 가격 시뮬레이션
  async simulatePriceChanges(): Promise<void> {
    this.logger.log(
      '🎲 SQLite 데이터베이스의 모든 주식 가격을 시뮬레이션합니다.',
    );
    const stocks = await this.findAll();

    for (const stock of stocks) {
      const oldPrice = stock.currentPrice;
      const changePercent = (Math.random() - 0.5) * 0.1; // -5% ~ +5%
      const newPrice = Math.round(stock.currentPrice * (1 + changePercent));
      stock.updatePrice(newPrice);
      await this.stocksRepository.save(stock);
      this.logger.log(
        `📊 "${stock.name}" 가격 시뮬레이션: ${oldPrice} → ${newPrice} (${changePercent > 0 ? '+' : ''}${(changePercent * 100).toFixed(2)}%)`,
      );
    }
    this.logger.log(
      `✅ SQLite에서 ${stocks.length}개 주식의 가격 시뮬레이션 완료`,
    );
  }

  // 종목코드 중복 확인
  async isSymbolUnique(symbol: string): Promise<boolean> {
    this.logger.log(
      `🔍 종목코드 ${symbol}의 중복 여부를 SQLite 데이터베이스에서 확인합니다.`,
    );
    const existingStock = await this.stocksRepository.findOne({
      where: { symbol },
    });
    const isUnique = !existingStock;
    this.logger.log(
      `✅ 종목코드 ${symbol} 중복 확인 완료: ${isUnique ? '사용 가능' : '이미 존재'}`,
    );
    return isUnique;
  }

  // 종목코드 유효성 검증
  validateStockSymbol(symbol: string): boolean {
    this.logger.log(`✅ 종목코드 ${symbol}의 유효성을 검증합니다.`);
    const isValid = /^\d{6}$/.test(symbol);
    this.logger.log(
      `✅ 종목코드 ${symbol} 유효성 검증 결과: ${isValid ? '유효함' : '유효하지 않음'}`,
    );
    return isValid;
  }
}
