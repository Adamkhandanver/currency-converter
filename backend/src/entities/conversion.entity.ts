import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Conversion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 4 })
  rate: number;

  @Column('decimal', { precision: 15, scale: 4 })
  result: number;

  @Column()
  date: string;

  @CreateDateColumn()
  timestamp: Date;
}