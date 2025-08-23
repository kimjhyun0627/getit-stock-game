import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSession } from '../../auth/entities/user-session.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  name: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ unique: true, nullable: true })
  kakaoId?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 10000000, // 1000만원
  })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  isLeaderboardVisible: boolean;

  // Relations
  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];
}
