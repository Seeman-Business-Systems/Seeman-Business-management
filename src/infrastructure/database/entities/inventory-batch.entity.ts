import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';
import InventoryBatchItemEntity from './inventory-batch-item.entity';

@Entity({ name: 'inventory_batches' })
class InventoryBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_number', type: 'varchar', length: 100 })
  batchNumber: string;

  @Column({ name: 'arrived_at', type: 'date' })
  arrivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'offloaded_at', type: 'timestamptz', nullable: true })
  offloadedAt: Date | null;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'created_by' })
  creator: StaffEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => InventoryBatchItemEntity, (item) => item.batch, { cascade: true })
  items: InventoryBatchItemEntity[];
}

export default InventoryBatchEntity;
