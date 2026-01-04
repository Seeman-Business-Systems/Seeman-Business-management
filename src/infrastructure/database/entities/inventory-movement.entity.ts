import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import InventoryBatchEntity from './inventory-batch.entity';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';

@Entity({ name: 'inventory_movements' })
class InventoryMovementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InventoryBatchEntity, (batch) => batch.movements)
  @JoinColumn({ name: 'inventory_batch_id' })
  inventoryBatch: InventoryBatchEntity;

  @Column({
    type: 'enum',
    enum: InventoryMovementType,
  })
  type: InventoryMovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  orderId: number | null;

  @Column({ type: 'int', nullable: true })
  fromWarehouseId: number | null;

  @Column({ type: 'int', nullable: true })
  toWarehouseId: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int' })
  actorId: number;

  @CreateDateColumn()
  createdAt: Date;
}

export default InventoryMovementEntity;