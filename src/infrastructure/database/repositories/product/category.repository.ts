import { Injectable } from '@nestjs/common';
import Category from 'src/domain/product/category';
import CategoryEntity from '../../entities/category.entity';

@Injectable()
abstract class CategoryRepository {
  abstract findById(id: number): Promise<Category | null>;
  abstract findByParentId(parentId: number | null): Promise<Category[]>;
  abstract findAll(): Promise<Category[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Category>;
  abstract commit(category: Category): Promise<Category>;
  abstract toDomain(entity: CategoryEntity): Category;
}

export default CategoryRepository;
