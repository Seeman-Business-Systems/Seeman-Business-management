import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Product from 'src/domain/product/product';
import ProductEntity from '../../entities/product.entity';
import ProductRepository from './product.repository';
import ProductStatus from 'src/domain/product/product-status';
import ProductType from 'src/domain/product/product-type';
import BrandEntity from '../../entities/brand.entity';
import CategoryEntity from '../../entities/category.entity';

@Injectable()
class ProductDBRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByBrandId(brandId: number): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { brand: { id: brandId } },
      relations: ['brand', 'category'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { category: { id: categoryId } },
      relations: ['brand', 'category'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(status: ProductStatus): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['brand', 'category'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByType(type: ProductType): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { productType: type },
      relations: ['brand', 'category'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find({
      relations: ['brand', 'category'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Product> {
    await this.repository.restore(id);
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    if (!entity) {
      throw new Error(`Product with id ${id} not found`);
    }
    return this.toDomain(entity);
  }

  async commit(product: Product): Promise<Product> {
    const entity = Object.assign(new ProductEntity(), {
      id: product.getId(),
      name: product.getName(),
      description: product.getDescription(),
      productType: product.getProductType(),
      status: product.getStatus(),
      brand: { id: product.getBrandId() } as BrandEntity,
      category: { id: product.getCategoryId() } as CategoryEntity,
      createdBy: product.getCreatedBy(),
      createdAt: product.getCreatedAt(),
      updatedAt: product.getUpdatedAt(),
      deletedAt: product.getDeletedAt(),
    });

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['brand', 'category'],
    });
    if (!fullEntity) {
      throw new Error('Failed to retrieve saved product');
    }
    return this.toDomain(fullEntity);
  }

  toDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.description,
      entity.productType,
      entity.status,
      entity.brand.id,
      entity.category.id,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default ProductDBRepository;
