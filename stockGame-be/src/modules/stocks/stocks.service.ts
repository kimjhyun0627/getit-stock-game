import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
  ) {}

  async findAll(): Promise<Stock[]> {
    return await this.stocksRepository.find();
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stocksRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`ID ${id}인 주식을 찾을 수 없습니다.`);
    }
    return stock;
  }

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    // 종목코드 중복 확인
    if (!(await this.isSymbolUnique(createStockDto.symbol))) {
      throw new Error(
        `종목코드 ${createStockDto.symbol}는 이미 사용 중입니다.`,
      );
    }

    // 종목코드 유효성 검증
    if (!this.validateStockSymbol(createStockDto.symbol)) {
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

    return await this.stocksRepository.save(newStock);
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stock = await this.findOne(id);

    if (updateStockDto.currentPrice !== undefined) {
      stock.updatePrice(updateStockDto.currentPrice);
    }

    if (updateStockDto.volume !== undefined) {
      stock.updateVolume(updateStockDto.volume);
    }

    if (updateStockDto.name !== undefined) {
      stock.name = updateStockDto.name;
    }

    if (updateStockDto.symbol !== undefined) {
      stock.symbol = updateStockDto.symbol;
    }

    stock.updatedAt = new Date();

    return await this.stocksRepository.save(stock);
  }

  async updatePrice(
    id: string,
    updatePriceDto: UpdateStockPriceDto,
  ): Promise<Stock> {
    const stock = await this.findOne(id);
    stock.updatePrice(updatePriceDto.currentPrice);
    return await this.stocksRepository.save(stock);
  }

  async updateVolume(
    id: string,
    updateVolumeDto: UpdateStockVolumeDto,
  ): Promise<Stock> {
    const stock = await this.findOne(id);
    stock.updateVolume(updateVolumeDto.volume);
    return await this.stocksRepository.save(stock);
  }

  async remove(id: string): Promise<void> {
    const stock = await this.findOne(id);
    await this.stocksRepository.remove(stock);
  }

  // 주식 가격 시뮬레이션
  async simulatePriceChanges(): Promise<void> {
    const stocks = await this.findAll();

    for (const stock of stocks) {
      const changePercent = (Math.random() - 0.5) * 0.1; // -5% ~ +5%
      const newPrice = Math.round(stock.currentPrice * (1 + changePercent));
      stock.updatePrice(newPrice);
      await this.stocksRepository.save(stock);
    }
  }

  // 종목코드 중복 확인
  async isSymbolUnique(symbol: string): Promise<boolean> {
    const existingStock = await this.stocksRepository.findOne({
      where: { symbol },
    });
    return !existingStock;
  }

  // 종목코드 유효성 검증
  validateStockSymbol(symbol: string): boolean {
    // 6자리 숫자인지 확인
    return /^\d{6}$/.test(symbol);
  }
}
