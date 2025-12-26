import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import { BranchFilters } from './branch.filters';
import Branch from 'src/domain/branch/branch';
import { Repository } from 'typeorm';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
class BranchQuery {
  constructor(
    @InjectRepository(BranchEntity)
    public readonly branches: Repository<BranchEntity>,
    public readonly branchRepo: BranchRepository,
  ) {}

  async findBy(filters: BranchFilters): Promise<Branch[]> {
    const query = this.branches.createQueryBuilder('branch');

    // Handle dynamic relation loading
    if (filters.includeStaff) {
      query.leftJoinAndSelect('branch.staff', 'staff');
    }

    if (filters.includeInventory) {
      query.leftJoinAndSelect('branch.inventory', 'inventory');
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

    const records = await query.getMany();

    console.log('records: ', records);

    return records.map((entity) => this.branchRepo.toDomain(entity));
  }
}

export default BranchQuery;
