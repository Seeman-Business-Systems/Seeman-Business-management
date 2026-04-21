import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ProductEntity from 'src/infrastructure/database/entities/product.entity';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';
import Product from 'src/domain/product/product';

export interface ProductFilters {
  ids?: number | number[];
  name?: string;
  brandId?: number | number[];
  categoryId?: number | number[];
  status?: number | number[];
  productType?: number | number[];
  includeBrand?: boolean;
  includeCategory?: boolean;
  includeVariants?: boolean;
}

@Injectable()
class ProductQuery {
  constructor(
    @InjectRepository(ProductEntity)
    public readonly products: Repository<ProductEntity>,
    public readonly productRepo: ProductRepository,
  ) {}

  async findBy(filters: ProductFilters): Promise<Product[]> {
    const query = this.products.createQueryBuilder('product');

    // Always load brand and category for toDomain to work
    query.leftJoinAndSelect('product.brand', 'brand');
    query.leftJoinAndSelect('product.category', 'category');

    if (filters.includeVariants) {
      query.leftJoinAndSelect('product.variants', 'variants');
    }

    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('product.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('product.id = :id', { id: filters.ids });
      }
    }

    if (filters.name) {
      query.andWhere('product.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.brandId) {
      if (Array.isArray(filters.brandId)) {
        query.andWhere('brand.id IN (:...brandIds)', {
          brandIds: filters.brandId,
        });
      } else {
        query.andWhere('brand.id = :brandId', {
          brandId: filters.brandId,
        });
      }
    }

    if (filters.categoryId) {
      if (Array.isArray(filters.categoryId)) {
        query.andWhere('category.id IN (:...categoryIds)', {
          categoryIds: filters.categoryId,
        });
      } else {
        query.andWhere('category.id = :categoryId', {
          categoryId: filters.categoryId,
        });
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.andWhere('product.status IN (:...statuses)', {
          statuses: filters.status,
        });
      } else {
        query.andWhere('product.status = :status', { status: filters.status });
      }
    }

    if (filters.productType) {
      if (Array.isArray(filters.productType)) {
        query.andWhere('product.productType IN (:...types)', {
          types: filters.productType,
        });
      } else {
        query.andWhere('product.productType = :type', {
          type: filters.productType,
        });
      }
    }

    const records = await query.getMany();

    return records.map((entity) => this.productRepo.toDomain(entity));
  }
}

export default ProductQuery;
