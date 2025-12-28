import { Injectable } from '@nestjs/common';
import ProductVariant from 'src/domain/product/product-variant';
import ProductVariantEntity from '../../entities/product-variant.entity';

@Injectable()
abstract class ProductVariantRepository {
  abstract findById(id: number): Promise<ProductVariant | null>;
  abstract findBySku(sku: string): Promise<ProductVariant | null>;
  abstract findByProductId(productId: number): Promise<ProductVariant[]>;
  abstract findAll(): Promise<ProductVariant[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<ProductVariant>;
  abstract commit(variant: ProductVariant): Promise<ProductVariant>;
  abstract toDomain(entity: ProductVariantEntity): ProductVariant;
}

export default ProductVariantRepository;
