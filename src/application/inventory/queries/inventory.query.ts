import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Inventory from 'src/domain/inventory/inventory';
import InventoryEntity from 'src/infrastructure/database/entities/inventory.entity';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import { InventoryFilters } from './inventory.filters';

@Injectable()
class InventoryQuery {
  constructor(
    @InjectRepository(InventoryEntity)
    public readonly inventories: Repository<InventoryEntity>,
    public readonly inventoryRepo: InventoryRepository,
  ) {}

  async findBy(filters: InventoryFilters): Promise<Inventory[]> {
    const query = this.inventories.createQueryBuilder('inventory');

    if (filters.includeVariant) {
      query.leftJoinAndSelect('inventory.variant', 'variant');
    }

    if (filters.includeWarehouse) {
      query.leftJoinAndSelect('inventory.warehouse', 'warehouse');
    }

    if (filters.includeBatches) {
      query.leftJoinAndSelect('inventory.batches', 'batches');
    }

    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('inventory.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('inventory.id = :id', { id: filters.ids });
      }
    }

    if (filters.variantId) {
      if (Array.isArray(filters.variantId)) {
        query.andWhere('inventory.variantId IN (:...variantIds)', {
          variantIds: filters.variantId,
        });
      } else {
        query.andWhere('inventory.variantId = :variantId', {
          variantId: filters.variantId,
        });
      }
    }

    if (filters.warehouseId) {
      if (Array.isArray(filters.warehouseId)) {
        query.andWhere('inventory.warehouseId IN (:...warehouseIds)', {
          warehouseIds: filters.warehouseId,
        });
      } else {
        query.andWhere('inventory.warehouseId = :warehouseId', {
          warehouseId: filters.warehouseId,
        });
      }
    }

    if (filters.lowStock) {
      query.andWhere('inventory.totalQuantity < inventory.minimumQuantity');
    }

    const records = await query.getMany();

    return records.map((entity) => this.inventoryRepo.toDomain(entity));
  }

  async getLowStockItems(warehouseId?: number): Promise<Inventory[]> {
    return this.inventoryRepo.findLowStock(warehouseId);
  }

  async getStockSummary(variantId: number): Promise<{
    totalQuantity: number;
    totalReserved: number;
    totalAvailable: number;
    warehouses: Inventory[];
  }> {
    const inventories = await this.inventoryRepo.findByVariant(variantId);

    const totalQuantity = inventories.reduce(
      (sum, inv) => sum + inv.getTotalQuantity(),
      0,
    );
    const totalReserved = inventories.reduce(
      (sum, inv) => sum + inv.getReservedQuantity(),
      0,
    );
    const totalAvailable = inventories.reduce(
      (sum, inv) => sum + inv.getAvailableQuantity(),
      0,
    );

    return {
      totalQuantity,
      totalReserved,
      totalAvailable,
      warehouses: inventories,
    };
  }
}

export default InventoryQuery;