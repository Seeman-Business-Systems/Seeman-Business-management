import { Injectable } from '@nestjs/common';
import Brand from 'src/domain/product/brand';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class BrandSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(brand: Brand) {
    const creator = await this.staff.findById(brand.getCreatedBy());

    return {
      id: brand.getId(),
      name: brand.getName(),
      code: brand.getCode(),
      description: brand.getDescription(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: brand.getCreatedAt(),
      updatedAt: brand.getUpdatedAt(),
      deletedAt: brand.getDeletedAt(),
    };
  }

  async serialiseMany(brands: Brand[]) {
    return Promise.all(brands.map((brand) => this.serialise(brand)));
  }
}

export default BrandSerialiser;
