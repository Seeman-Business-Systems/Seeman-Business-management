import { Injectable } from '@nestjs/common';
import Product from 'src/domain/product/product';
import ProductEntity from '../../entities/product.entity';
import ProductStatus from 'src/domain/product/product-status';
import ProductType from 'src/domain/product/product-type';

@Injectable()
abstract class ProductRepository {
  abstract findById(id: number): Promise<Product | null>;
  abstract findByBrandId(brandId: number): Promise<Product[]>;
  abstract findByCategoryId(categoryId: number): Promise<Product[]>;
  abstract findByStatus(status: ProductStatus): Promise<Product[]>;
  abstract findByType(type: ProductType): Promise<Product[]>;
  abstract findAll(): Promise<Product[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Product>;
  abstract commit(product: Product): Promise<Product>;
  abstract toDomain(entity: ProductEntity): Product;
}

export default ProductRepository;
