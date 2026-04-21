import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import { WarehouseFilters } from './warehouse.filters';
import Warehouse from 'src/domain/warehouse/warehouse';
import { Repository } from 'typeorm';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
class WarehouseQuery {
  constructor(
    @InjectRepository(WarehouseEntity)
    public readonly warehouses: Repository<WarehouseEntity>,
    public readonly warehouseRepo: WarehouseRepository,
  ) {}

  async findBy(filters: WarehouseFilters): Promise<Warehouse[]> {
    const query = this.warehouses.createQueryBuilder('warehouse');

    // Always join branch so branchId is available via entity.branch.id
    query.leftJoinAndSelect('warehouse.branch', 'branch');

    // Handle filters
    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('warehouse.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('warehouse.id = :id', { id: filters.ids });
      }
    }

    if (filters.name) {
      query.andWhere('warehouse.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.status) {
      query.andWhere('warehouse.status = :status', { status: filters.status });
    }

    if (filters.warehouseType) {
      if (Array.isArray(filters.warehouseType)) {
        query.andWhere('warehouse.warehouseType IN (:...types)', {
          types: filters.warehouseType,
        });
      } else {
        query.andWhere('warehouse.warehouseType = :type', {
          type: filters.warehouseType,
        });
      }
    }

    // Use join alias for branchId filter (no scalar branchId column on entity)
    if (filters.branchId) {
      if (Array.isArray(filters.branchId)) {
        query.andWhere('branch.id IN (:...branchIds)', {
          branchIds: filters.branchId,
        });
      } else {
        query.andWhere('branch.id = :branchId', {
          branchId: filters.branchId,
        });
      }
    }

    // Handle array filters for city
    if (filters.city) {
      if (Array.isArray(filters.city)) {
        query.andWhere('warehouse.city IN (:...cities)', {
          cities: filters.city,
        });
      } else {
        query.andWhere('warehouse.city = :city', { city: filters.city });
      }
    }

    // Handle array filters for state
    if (filters.state) {
      if (Array.isArray(filters.state)) {
        query.andWhere('warehouse.state IN (:...states)', {
          states: filters.state,
        });
      } else {
        query.andWhere('warehouse.state = :state', { state: filters.state });
      }
    }

    const records = await query.getMany();

    return records.map((entity) => this.warehouseRepo.toDomain(entity));
  }
}

export default WarehouseQuery;
