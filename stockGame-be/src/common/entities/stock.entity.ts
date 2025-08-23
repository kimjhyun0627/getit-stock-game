import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column({
    type: 'real',
  })
  currentPrice: number;

  @Column({
    type: 'real',
  })
  previousPrice: number;

  @Column({
    type: 'real',
  })
  change: number;

  @Column({
    type: 'real',
  })
  changePercent: number;

  @Column('bigint')
  volume: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  constructor(partial: Partial<Stock>) {
    Object.assign(this, partial);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updatePrice(newPrice: number) {
    this.previousPrice = this.currentPrice;
    this.currentPrice = newPrice;
    this.change = this.currentPrice - this.previousPrice;
    this.changePercent = (this.change / this.previousPrice) * 100;
    this.updatedAt = new Date();
  }

  updateVolume(newVolume: number) {
    this.volume = newVolume;
    this.updatedAt = new Date();
  }

  // 거래량 증가 (매수/매도 시)
  increaseVolume(quantity: number) {
    this.volume += quantity;
    this.updatedAt = new Date();
  }

  // 거래량 감소 (필요시)
  decreaseVolume(quantity: number) {
    this.volume = Math.max(0, this.volume - quantity);
    this.updatedAt = new Date();
  }
}
