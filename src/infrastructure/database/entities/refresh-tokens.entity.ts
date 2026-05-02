import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';

@Index(['staffId'])
@Index(['token']) // if you look up by token value
@Entity('refresh_tokens')
class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => StaffEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffEntity;

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
