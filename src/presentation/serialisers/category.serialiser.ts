import { Injectable } from '@nestjs/common';
import Category from 'src/domain/product/category';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class CategorySerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
    private readonly categories: CategoryRepository,
  ) {}

  async serialise(category: Category, includeParent: boolean = false) {
    const creator = await this.staff.findById(category.getCreatedBy());

    const result: any = {
      id: category.getId(),
      name: category.getName(),
      description: category.getDescription(),
      parentId: category.getParentId(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: category.getCreatedAt(),
      updatedAt: category.getUpdatedAt(),
      deletedAt: category.getDeletedAt(),
    };

    if (includeParent && category.getParentId()) {
      const parent = await this.categories.findById(category.getParentId()!);
      result.parent = parent ? await this.serialise(parent, false) : null;
    }

    return result;
  }

  async serialiseMany(categories: Category[], includeParent: boolean = false) {
    return Promise.all(
      categories.map((category) => this.serialise(category, includeParent)),
    );
  }
}

export default CategorySerialiser;
