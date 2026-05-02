import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import BrandEntity from './brand.entity';
import CategoryEntity from './category.entity';
import ProductVariantEntity from './product-variant.entity';
import ProductType from 'src/domain/product/product-type';
import ProductStatus from 'src/domain/product/product-status';

@Index(['brand'])
@Index(['category'])
@Index(['status'])
@Index(['productType'])
@Entity('products')
class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  productType: ProductType;

  @Column({ type: 'int' })
  status: ProductStatus;

  @ManyToOne(() => BrandEntity, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ type: 'int' })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  variants: ProductVariantEntity[];
}

export default ProductEntity;
