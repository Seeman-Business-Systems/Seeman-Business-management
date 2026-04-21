import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import SaleEntity from './sale.entity';
import ProductVariantEntity from './product-variant.entity';

@Entity({ name: 'sale_line_items' })
class SaleLineItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SaleEntity, (sale) => sale.lineItems)
  @JoinColumn({ name: 'sale_id' })
  sale: SaleEntity;

  @Column({ name: 'sale_id' })
  saleId: number;

  @Column({ name: 'variant_id' })
  variantId: number;

  @ManyToOne(() => ProductVariantEntity)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'line_total' })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default SaleLineItemEntity;
