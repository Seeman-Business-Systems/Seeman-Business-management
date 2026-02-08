import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import { BranchFilters } from './branch.filters';
import Branch from 'src/domain/branch/branch';
import { Repository } from 'typeorm';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface PaginatedBranches {
  data: Branch[];
  total: number;
  skip: number;
  take: number;
}

@Injectable()
class BranchQuery {
  constructor(
    @InjectRepository(BranchEntity)
    public readonly branches: Repository<BranchEntity>,
    public readonly branchRepo: BranchRepository,
  ) {}

  async findBy(filters: BranchFilters): Promise<PaginatedBranches> {
    const query = this.branches.createQueryBuilder('branch');

    // Handle dynamic relation loading
    if (filters.includeStaff) {
      query.leftJoinAndSelect('branch.staff', 'staff');
    }

    if (filters.includeInventory) {
      query.leftJoinAndSelect('branch.inventory', 'inventory');
    }

    // Handle search (name, code, city, address) - case insensitive
    if (filters.search) {
      query.andWhere(
        '(branch.name ILIKE :search OR branch.code ILIKE :search OR branch.city ILIKE :search OR branch.address ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Handle filters
    if (filters.name) {
      query.andWhere('branch.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.status) {
      query.andWhere('branch.status = :status', { status: filters.status });
    }

    if (filters.isHeadOffice !== undefined) {
      query.andWhere('branch.isHeadOffice = :isHeadOffice', {
        isHeadOffice: filters.isHeadOffice,
      });
    }

    if (filters.managerId) {
      query.andWhere('branch.managerId = :managerId', {
        managerId: filters.managerId,
      });
    }

    // Handle array filters for city
    if (filters.city) {
      if (Array.isArray(filters.city)) {
        query.andWhere('branch.city IN (:...cities)', { cities: filters.city });
      } else {
        query.andWhere('branch.city = :city', { city: filters.city });
      }
    }

    // Handle array filters for state
    if (filters.state) {
      if (Array.isArray(filters.state)) {
        query.andWhere('branch.state IN (:...states)', {
          states: filters.state,
        });
      } else {
        query.andWhere('branch.state = :state', { state: filters.state });
      }
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    const skip = filters.skip ?? 0;
    const take = filters.take ?? 10;

    query.skip(skip).take(take);

    // Order by newest first
    query.orderBy('branch.createdAt', 'DESC');

    const records = await query.getMany();

    return {
      data: records.map((entity) => this.branchRepo.toDomain(entity)),
      total,
      skip,
      take,
    };
  }
}

export default BranchQuery;
