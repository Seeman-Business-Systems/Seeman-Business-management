import { Injectable } from '@nestjs/common';
import InventoryRepository from '../repositories/inventory/inventory.repository';
import Inventory from 'src/domain/inventory/inventory';

@Injectable()
export class InventorySeed {
  constructor(private readonly inventories: InventoryRepository) {}

  async seed() {
    const existing = await this.inventories.findAll();
    if (existing.length > 0) {
      console.log('Inventory records already exist. Skipping seed.');
      return;
    }

    const inventoryData: Array<{
      variantId: number;
      warehouseId: number;
      totalQuantity: number;
      minimumQuantity: number;
      maximumQuantity: number;
    }> = [
      { variantId: 1, warehouseId: 1, totalQuantity: 80, minimumQuantity: 20, maximumQuantity: 100 },
      { variantId: 1, warehouseId: 5, totalQuantity: 40, minimumQuantity: 15, maximumQuantity: 60 },
      { variantId: 4, warehouseId: 1, totalQuantity: 100, minimumQuantity: 30, maximumQuantity: 150 },
      { variantId: 5, warehouseId: 2, totalQuantity: 75, minimumQuantity: 25, maximumQuantity: 120 },
      { variantId: 9, warehouseId: 3, totalQuantity: 25, minimumQuantity: 10, maximumQuantity: 50 },
      { variantId: 11, warehouseId: 1, totalQuantity: 40, minimumQuantity: 15, maximumQuantity: 80 },
      { variantId: 15, warehouseId: 1, totalQuantity: 250, minimumQuantity: 50, maximumQuantity: 200 },
      { variantId: 15, warehouseId: 2, totalQuantity: 120, minimumQuantity: 40, maximumQuantity: 150 },
      { variantId: 17, warehouseId: 2, totalQuantity: 200, minimumQuantity: 60, maximumQuantity: 250 },
      { variantId: 23, warehouseId: 1, totalQuantity: 90, minimumQuantity: 20, maximumQuantity: 100 },
      { variantId: 24, warehouseId: 1, totalQuantity: 45, minimumQuantity: 15, maximumQuantity: 80 },
      { variantId: 25, warehouseId: 1, totalQuantity: 30, minimumQuantity: 10, maximumQuantity: 60 },
      { variantId: 26, warehouseId: 3, totalQuantity: 20, minimumQuantity: 8, maximumQuantity: 40 },
      { variantId: 28, warehouseId: 5, totalQuantity: 25, minimumQuantity: 10, maximumQuantity: 50 },
      { variantId: 18, warehouseId: 1, totalQuantity: 10, minimumQuantity: 5, maximumQuantity: 25 },
      { variantId: 20, warehouseId: 1, totalQuantity: 8, minimumQuantity: 3, maximumQuantity: 20 },
      { variantId: 21, warehouseId: 5, totalQuantity: 35, minimumQuantity: 12, maximumQuantity: 60 },
      { variantId: 10, warehouseId: 4, totalQuantity: 10, minimumQuantity: 15, maximumQuantity: 50 }, // below minimum — triggers low stock alert
    ];

    let count = 0;
    for (const data of inventoryData) {
      const inventory = new Inventory(
        undefined,
        data.variantId,
        data.warehouseId,
        data.totalQuantity,
        data.minimumQuantity,
        data.maximumQuantity,
        0,
        new Date(),
        new Date(),
      );
      await this.inventories.commit(inventory);
      count++;
    }

    console.log(`✅ Inventory seed: ${count} records created`);
  }
}
