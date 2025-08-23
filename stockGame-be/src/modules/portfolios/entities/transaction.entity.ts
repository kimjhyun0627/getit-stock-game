import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Stock } from '../../../common/entities/stock.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  stockId: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  type: TransactionType;

  @Column('bigint')
  quantity: number;

  @Column({
    type: 'real',
  })
  price: number;

  @Column({
    type: 'real',
  })
  totalAmount: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Stock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stockId' })
  stock: Stock;
}
