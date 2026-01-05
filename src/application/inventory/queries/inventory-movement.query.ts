import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementEntity from 'src/infrastructure/database/entities/inventory-movement.entity';
import InventoryMovementRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.repository';
import { InventoryMovementFilters } from './inventory-movement.filters';

@Injectable()
class InventoryMovementQuery {
  constructor(
    @InjectRepository(InventoryMovementEntity)
    public readonly inventoryMovements: Repository<InventoryMovementEntity>,
    public readonly inventoryMovementRepo: InventoryMovementRepository,
  ) {}

  async findBy(filters: InventoryMovementFilters): Promise<InventoryMovement[]> {
    const query = this.inventoryMovements.createQueryBuilder('movement');

    if (filters.includeInventoryBatch) {
      query.leftJoinAndSelect('movement.inventoryBatch', 'inventoryBatch');
    }

    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('movement.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('movement.id = :id', { id: filters.ids });
      }
    }

    if (filters.inventoryBatchId) {
      if (Array.isArray(filters.inventoryBatchId)) {
        query.andWhere('movement.inventoryBatchId IN (:...batchIds)', {
          batchIds: filters.inventoryBatchId,
        });
      } else {
        query.andWhere('movement.inventoryBatchId = :batchId', {
          batchId: filters.inventoryBatchId,
        });
      }
    }

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query.andWhere('movement.type IN (:...types)', {
          types: filters.type,
        });
      } else {
        query.andWhere('movement.type = :type', { type: filters.type });
      }
    }

    if (filters.orderId) {
      query.andWhere('movement.orderId = :orderId', {
        orderId: filters.orderId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters.startDate) {
      query.andWhere('movement.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    } else if (filters.endDate) {
      query.andWhere('movement.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query.orderBy('movement.createdAt', 'DESC');

    const records = await query.getMany();

    return records.map((entity) => this.inventoryMovementRepo.toDomain(entity));
  }

  async getMovementHistory(batchId: number): Promise<InventoryMovement[]> {
    return this.inventoryMovementRepo.findByBatchId(batchId);
  }
}

export default InventoryMovementQuery;