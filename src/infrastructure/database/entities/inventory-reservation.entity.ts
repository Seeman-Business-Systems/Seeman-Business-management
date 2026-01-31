import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import ProductVariantEntity from './product-variant.entity';
import WarehouseEntity from './warehouse.entity';
import StaffEntity from './staff.entity';

@Entity('inventory_reservations')
class InventoryReservationEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'int', name: 'order_id', nullable: true })
  orderId: number | null;

  @Column({ type: 'int', name: 'customer_id', nullable: true })
  customerId: number | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', name: 'reserved_by' })
  reservedBy: number;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'reserved_by' })
  reservedByStaff: StaffEntity;

  @Column({ type: 'timestamp', name: 'reserved_at' })
  reservedAt: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'int' })
  status: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default InventoryReservationEntity;
