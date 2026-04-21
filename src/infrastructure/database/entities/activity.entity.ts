import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';
import ActivityType from 'src/domain/activity/activity-type';

@Entity({ name: 'activities' })
class ActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId: number;

  @ManyToOne(() => StaffEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor: StaffEntity;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId: number | null;

  @Column({ name: 'entity_label', type: 'varchar', nullable: true })
  entityLabel: string | null;

  @Column({ name: 'branch_id', type: 'int', nullable: true })
  branchId: number | null;

  @Column({ name: 'warehouse_id', type: 'int', nullable: true })
  warehouseId: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default ActivityEntity;
