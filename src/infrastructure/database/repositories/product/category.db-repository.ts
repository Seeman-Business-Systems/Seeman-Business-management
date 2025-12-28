import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import Category from 'src/domain/product/category';
import CategoryEntity from '../../entities/category.entity';
import CategoryRepository from './category.repository';

@Injectable()
class CategoryDBRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async findById(id: number): Promise<Category | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['parent'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByParentId(parentId: number | null): Promise<Category[]> {
    const entities = await this.repository.find({
      where: parentId === null ? { parent: IsNull() } : { parent: { id: parentId } },
      relations: ['parent'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<Category[]> {
    const entities = await this.repository.find({ relations: ['parent'] });
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Category> {
    await this.repository.restore(id);
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!entity) {
      throw new Error(`Category with id ${id} not found`);
    }
    return this.toDomain(entity);
  }

  async commit(category: Category): Promise<Category> {
    const entity = Object.assign(new CategoryEntity(), {
      id: category.getId(),
      name: category.getName(),
      description: category.getDescription(),
      parent: category.getParentId() ? ({ id: category.getParentId() } as CategoryEntity) : null,
      createdBy: category.getCreatedBy(),
      createdAt: category.getCreatedAt(),
      updatedAt: category.getUpdatedAt(),
      deletedAt: category.getDeletedAt(),
    });

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['parent'],
    });
    if (!fullEntity) {
      throw new Error('Failed to retrieve saved category');
    }
    return this.toDomain(fullEntity);
  }

  toDomain(entity: CategoryEntity): Category {
    return new Category(
      entity.id,
      entity.name,
      entity.description,
      entity.parent?.id ?? null,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default CategoryDBRepository;
