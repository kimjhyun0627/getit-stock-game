import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  summary: string;

  @Column('text')
  content: string;

  @Column({
    type: 'varchar',
    length: 50, // 주식 심볼을 포함할 수 있도록 길이 증가
  })
  category: string; // 주식 심볼 또는 기본 카테고리 허용

  @Column({
    type: 'datetime',
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  constructor(partial: Partial<News>) {
    Object.assign(this, partial);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isPublished = false;
  }

  publish() {
    this.isPublished = true;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  unpublish() {
    this.isPublished = false;
    this.publishedAt = null;
    this.updatedAt = new Date();
  }
}
