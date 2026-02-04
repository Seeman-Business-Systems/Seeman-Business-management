import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchEntity from 'src/infrastructure/database/entities/inventory-batch.entity';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import { InventoryBatchFilters } from './inventory-batch.filters';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

@Injectable()
class InventoryBatchQuery {
  constructor(
    @InjectRepository(InventoryBatchEntity)
    public readonly inventoryBatches: Repository<InventoryBatchEntity>,
    public readonly inventoryBatchRepo: InventoryBatchRepository,
  ) {}

  async findBy(filters: InventoryBatchFilters): Promise<InventoryBatch[]> {
    const query = this.inventoryBatches.createQueryBuilder('batch');

    if (filters.includeInventory) {
      query.leftJoinAndSelect('batch.inventory', 'inventory');
    }

    if (filters.includeWarehouse) {
      query.leftJoinAndSelect('batch.warehouse', 'warehouse');
    }

    if (filters.includeMovements) {
      query.leftJoinAndSelect('batch.movements', 'movements');
    }

    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('batch.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('batch.id = :id', { id: filters.ids });
      }
    }

    if (filters.inventoryId) {
      if (Array.isArray(filters.inventoryId)) {
        query.andWhere('batch.inventoryId IN (:...inventoryIds)', {
          inventoryIds: filters.inventoryId,
        });
      } else {
        query.andWhere('batch.inventoryId = :inventoryId', {
          inventoryId: filters.inventoryId,
        });
      }
    }

    if (filters.warehouseId) {
      if (Array.isArray(filters.warehouseId)) {
        query.andWhere('batch.warehouseId IN (:...warehouseIds)', {
          warehouseIds: filters.warehouseId,
        });
      } else {
        query.andWhere('batch.warehouseId = :warehouseId', {
          warehouseId: filters.warehouseId,
        });
      }
    }

    if (filters.variantId) {
      query.leftJoin('batch.inventory', 'inv');
      query.leftJoin('inv.variant', 'variant');

      if (Array.isArray(filters.variantId)) {
        query.andWhere('variant.id IN (:...variantIds)', {
          variantIds: filters.variantId,
        });
      } else {
        query.andWhere('variant.id = :variantId', {
          variantId: filters.variantId,
        });
      }
    }

    if (filters.batchNumber) {
      query.andWhere('batch.batchNumber ILIKE :batchNumber', {
        batchNumber: `%${filters.batchNumber}%`,
      });
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.andWhere('batch.status IN (:...statuses)', {
          statuses: filters.status,
        });
      } else {
        query.andWhere('batch.status = :status', { status: filters.status });
      }
    }

    if (filters.supplierId) {
      if (Array.isArray(filters.supplierId)) {
        query.andWhere('batch.supplierId IN (:...supplierIds)', {
          supplierIds: filters.supplierId,
        });
      } else {
        query.andWhere('batch.supplierId = :supplierId', {
          supplierId: filters.supplierId,
        });
      }
    }

    if (filters.expiringInDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.expiringInDays);

      query.andWhere('batch.expiryDate <= :futureDate', { futureDate });
      query.andWhere('batch.expiryDate IS NOT NULL');
      query.andWhere('batch.status = :arrivedStatus', {
        arrivedStatus: InventoryBatchStatus.ARRIVED,
      });
    }

    const records = await query.getMany();

    return records.map((entity) => this.inventoryBatchRepo.toDomain(entity));
  }

  async getExpiringBatches(days: number): Promise<InventoryBatch[]> {
    return this.inventoryBatchRepo.findExpiringBatches(days);
  }

  async getOldestBatches(
    variantId: number,
    warehouseId: number,
  ): Promise<InventoryBatch[]> {
    return this.inventoryBatchRepo.findOldestBatches(variantId, warehouseId);
  }
}

export default InventoryBatchQuery;
