import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import ProductVariantEntity from './product-variant.entity';
import InventoryBatchEntity from './inventory-batch.entity';
import WarehouseEntity from './warehouse.entity';

@Entity({ name: 'inventory_batch_items' })
class InventoryBatchItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_id' })
  batchId: number;

  @ManyToOne(() => InventoryBatchEntity, (batch) => batch.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: InventoryBatchEntity;

  @Column({ name: 'variant_id' })
  variantId: number;

  @ManyToOne(() => ProductVariantEntity)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column({ type: 'int' })
  quantity: number;
}

export default InventoryBatchItemEntity;
