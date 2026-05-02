import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import ProductVariantEntity from './product-variant.entity';
import WarehouseEntity from './warehouse.entity';


@Index(['variantId'])
@Index(['warehouseId'])
@Index(['totalQuantity', 'minimumQuantity'])
@Entity({ name: 'inventory' })
@Unique(['variant', 'warehouse'])
class InventoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ManyToOne(() => ProductVariantEntity)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column({ type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ type: 'int', default: 0 })
  minimumQuantity: number;

  @Column({ type: 'int', nullable: true })
  maximumQuantity: number | null;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default InventoryEntity;