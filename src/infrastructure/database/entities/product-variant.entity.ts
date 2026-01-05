import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import ProductEntity from './product.entity';

@Entity('product_variants')
class ProductVariantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductEntity, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  variantName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'selling_price' })
  sellingPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any> | null;

  @Column({ type: 'int' })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

export default ProductVariantEntity;
