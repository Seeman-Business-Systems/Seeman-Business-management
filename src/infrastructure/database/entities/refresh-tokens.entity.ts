import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';

@Entity('refresh_tokens')
class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StaffEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staffId: number;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  revokedAt?: Date;
}

export default RefreshTokenEntity;
