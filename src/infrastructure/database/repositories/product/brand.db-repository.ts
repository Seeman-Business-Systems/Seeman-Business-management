import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Brand from 'src/domain/product/brand';
import BrandEntity from '../../entities/brand.entity';
import BrandRepository from './brand.repository';

@Injectable()
class BrandDBRepository implements BrandRepository {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly repository: Repository<BrandEntity>,
  ) {}

  async findById(id: number): Promise<Brand | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Brand | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Brand[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Brand> {
    await this.repository.restore(id);
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`Brand with id ${id} not found`);
    }
    return this.toDomain(entity);
  }

  async commit(brand: Brand): Promise<Brand> {
    const entity = Object.assign(new BrandEntity(), {
      id: brand.getId(),
      name: brand.getName(),
      code: brand.getCode(),
      description: brand.getDescription(),
      createdBy: brand.getCreatedBy(),
      createdAt: brand.getCreatedAt(),
      updatedAt: brand.getUpdatedAt(),
      deletedAt: brand.getDeletedAt(),
    });

    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  toDomain(entity: BrandEntity): Brand {
    return new Brand(
      entity.id,
      entity.name,
      entity.code,
      entity.description,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default BrandDBRepository;
