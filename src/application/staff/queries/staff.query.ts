import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffFilters } from './staff.filters';
import Staff from 'src/domain/staff/staff';
import { Repository } from 'typeorm';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface PaginatedStaff {
  data: Staff[];
  total: number;
  skip: number;
  take: number;
}

@Injectable()
class StaffQuery {
  constructor(
    @InjectRepository(StaffEntity)
    public readonly staff: Repository<StaffEntity>,
    public readonly staffRepo: StaffRepository,
  ) {}

  async findBy(filters: StaffFilters): Promise<PaginatedStaff> {
    const query = this.staff.createQueryBuilder('staff')
      .where('staff.deletedAt IS NULL');

    // Handle search (firstName, lastName, email) - case insensitive
    if (filters.search) {
      query.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Handle roleId filter
    if (filters.roleId) {
      if (Array.isArray(filters.roleId)) {
        query.andWhere('staff.role_id IN (:...roleIds)', {
          roleIds: filters.roleId,
        });
      } else {
        query.andWhere('staff.role_id = :roleId', { roleId: filters.roleId });
      }
    }

    // Handle branchId filter
    if (filters.branchId) {
      if (Array.isArray(filters.branchId)) {
        query.andWhere('staff.branch_id IN (:...branchIds)', {
          branchIds: filters.branchId,
        });
      } else {
        query.andWhere('staff.branch_id = :branchId', {
          branchId: filters.branchId,
        });
      }
    }

    // Handle array filters for IDs
    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('staff.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('staff.id = :id', { id: filters.ids });
      }
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    const skip = filters.skip ?? 0;
    const take = filters.take ?? 10;

    query.skip(skip).take(take);

    // Order by newest first
    query.orderBy('staff.createdAt', 'DESC');

    const records = await query.getMany();

    return {
      data: records.map((entity) => this.staffRepo.toDomain(entity)),
      total,
      skip,
      take,
    };
  }
}

export default StaffQuery;
