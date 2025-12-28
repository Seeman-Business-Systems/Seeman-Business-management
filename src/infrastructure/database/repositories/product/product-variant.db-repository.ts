import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ProductVariant from 'src/domain/product/product-variant';
import ProductVariantEntity from '../../entities/product-variant.entity';
import ProductVariantRepository from './product-variant.repository';
import ProductEntity from '../../entities/product.entity';

@Injectable()
class ProductVariantDBRepository implements ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private readonly repository: Repository<ProductVariantEntity>,
  ) {}

  async findById(id: number): Promise<ProductVariant | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['product'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    const entity = await this.repository.findOne({
      where: { sku },
      relations: ['product'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    const entities = await this.repository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<ProductVariant[]> {
    const entities = await this.repository.find({ relations: ['product'] });
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<ProductVariant> {
    await this.repository.restore(id);
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!entity) {
      throw new Error(`Product variant with id ${id} not found`);
    }
    return this.toDomain(entity);
  }

  async commit(variant: ProductVariant): Promise<ProductVariant> {
    const entity = Object.assign(new ProductVariantEntity(), {
      id: variant.getId(),
      product: { id: variant.getProductId() } as ProductEntity,
      sku: variant.getSku(),
      variantName: variant.getVariantName(),
      price: variant.getPrice(),
      specifications: variant.getSpecifications(),
      createdBy: variant.getCreatedBy(),
      createdAt: variant.getCreatedAt(),
      updatedAt: variant.getUpdatedAt(),
      deletedAt: variant.getDeletedAt(),
    });

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['product'],
    });
    if (!fullEntity) {
      throw new Error('Failed to retrieve saved product variant');
    }
    return this.toDomain(fullEntity);
  }

  toDomain(entity: ProductVariantEntity): ProductVariant {
    return new ProductVariant(
      entity.id,
      entity.product.id,
      entity.sku,
      entity.variantName,
      Number(entity.price),
      entity.specifications,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default ProductVariantDBRepository;
