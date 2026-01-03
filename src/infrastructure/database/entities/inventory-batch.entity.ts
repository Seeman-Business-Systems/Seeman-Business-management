import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import InventoryEntity from './inventory.entity';
import WarehouseEntity from './warehouse.entity';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';
import InventoryMovementEntity from './inventory-movement.entity';

@Entity({ name: 'inventory_batches' })
class InventoryBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.batches)
  @JoinColumn({ name: 'inventory_id' })
  inventory: InventoryEntity;

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column({ type: 'varchar', length: 100, unique: true })
  batchNumber: string;

  @Column({ type: 'int' })
  supplierId: number;

  @Column({ type: 'int' })
  quantityReceived: number;

  @Column({ type: 'int' })
  currentQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPricePerUnit: number;

  @Column({
    type: 'enum',
    enum: InventoryBatchStatus,
    default: InventoryBatchStatus.ORDERED,
  })
  status: InventoryBatchStatus;

  @Column({ type: 'timestamp', nullable: true })
  receivedDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'int' })
  createdBy: number;

  @OneToMany(() => InventoryMovementEntity, (movement) => movement.inventoryBatch)
  movements: InventoryMovementEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

export default InventoryBatchEntity;