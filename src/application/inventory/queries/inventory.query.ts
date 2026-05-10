import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Inventory from 'src/domain/inventory/inventory';
import InventoryEntity from 'src/infrastructure/database/entities/inventory.entity';
import SupplyItemEntity from 'src/infrastructure/database/entities/supply-item.entity';
import SupplyStatus from 'src/domain/supply/supply-status';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import { InventoryFilters } from './inventory.filters';

@Injectable()
class InventoryQuery {
  constructor(
    @InjectRepository(InventoryEntity)
    public readonly inventories: Repository<InventoryEntity>,
    @InjectRepository(SupplyItemEntity)
    public readonly supplyItems: Repository<SupplyItemEntity>,
    public readonly inventoryRepo: InventoryRepository,
  ) {}

  private async attachPending(inventories: Inventory[]): Promise<void> {
    if (inventories.length === 0) return;

    const variantIds = Array.from(new Set(inventories.map((i) => i.getVariantId())));
    const warehouseIds = Array.from(new Set(inventories.map((i) => i.getWarehouseId())));

    const rows = await this.supplyItems
      .createQueryBuilder('item')
      .innerJoin('item.supply', 'supply')
      .select('item.variant_id', 'variantId')
      .addSelect('item.warehouse_id', 'warehouseId')
      .addSelect('SUM(item.quantity)', 'pending')
      .where('supply.status = :status', { status: SupplyStatus.DRAFT })
      .andWhere('item.variant_id IN (:...variantIds)', { variantIds })
      .andWhere('item.warehouse_id IN (:...warehouseIds)', { warehouseIds })
      .groupBy('item.variant_id')
      .addGroupBy('item.warehouse_id')
      .getRawMany<{ variantId: number; warehouseId: number; pending: string }>();

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(`${row.variantId}:${row.warehouseId}`, Number(row.pending));
    }

    for (const inv of inventories) {
      inv.setPendingQuantity(map.get(`${inv.getVariantId()}:${inv.getWarehouseId()}`) ?? 0);
    }
  }

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

    // if (filters.branchId) {
    //   query.andWhere('warehouse.branch_id = :branchId', { branchId: filters.branchId });
    // }

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

    if (filters.lowInventory) {
      query.andWhere('inventory.totalQuantity < inventory.minimumQuantity');
    }

    const records = await query.getMany();
    const inventories = records.map((entity) => this.inventoryRepo.toDomain(entity));
    await this.attachPending(inventories);
    return inventories;
  }

  async getLowInventoryItems(warehouseId?: number): Promise<Inventory[]> {
    return this.inventoryRepo.findLowInventory(warehouseId);
  }

  async getInventorySummary(variantId: number): Promise<{
    totalQuantity: number;
    totalAvailable: number;
    warehouses: Inventory[];
  }> {
    const inventories = await this.inventoryRepo.findByVariant(variantId);

    const totalQuantity = inventories.reduce(
      (sum, inv) => sum + inv.getTotalQuantity(),
      0,
    );
    const totalAvailable = inventories.reduce(
      (sum, inv) => sum + inv.getAvailableQuantity(),
      0,
    );

    return {
      totalQuantity,
      totalAvailable,
      warehouses: inventories,
    };
  }
}

export default InventoryQuery;
